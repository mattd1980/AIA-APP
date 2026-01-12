import { useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faImage, faSpinner, faCamera } from '@fortawesome/free-solid-svg-icons';
import { inventoryApi } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Upload() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [previewUrls, setPreviewUrls] = useState<Map<number, string>>(new Map());
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    noClick: false, // Permettre les clics
    noKeyboard: false, // Permettre le clavier
    onDrop: (acceptedFiles) => {
      setFiles((prev) => [...prev, ...acceptedFiles]);
    },
  });

  // Détecter si on est sur mobile
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Créer les previews URLs quand les fichiers changent
  useEffect(() => {
    const newUrls = new Map<number, string>();
    files.forEach((file, index) => {
      if (!previewUrls.has(index)) {
        newUrls.set(index, URL.createObjectURL(file));
      } else {
        newUrls.set(index, previewUrls.get(index)!);
      }
    });
    setPreviewUrls(newUrls);

    // Nettoyer les URLs supprimées
    return () => {
      previewUrls.forEach((url, index) => {
        if (!files[index]) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [files]);

  // Ouvrir la caméra
  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Caméra arrière sur mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setCameraStream(stream);
      setIsCameraOpen(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      // Fallback: utiliser l'input file avec capture
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      } else {
        alert('Impossible d\'accéder à la caméra. Veuillez autoriser l\'accès ou utiliser le bouton "Sélectionner des fichiers".');
      }
    }
  };

  // Prendre une photo depuis la caméra
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `photo_${Date.now()}.jpg`, {
              type: 'image/jpeg',
            });
            setFiles((prev) => [...prev, file]);
            closeCamera();
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  // Fermer la caméra
  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
  };

  // Gérer la sélection de fichiers depuis l'input camera (fallback mobile)
  const handleCameraFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      setFiles((prev) => [...prev, ...Array.from(selectedFiles)]);
    }
    // Reset input pour permettre de sélectionner le même fichier
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      alert('Veuillez sélectionner au moins une image');
      return;
    }

    try {
      setUploading(true);
      const inventory = await inventoryApi.create(files);
      navigate(`/inventory/${inventory.id}`);
    } catch (error: any) {
      console.error('Error uploading:', error);
      alert('Erreur lors de l\'upload: ' + (error.message || 'Erreur inconnue'));
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index: number) => {
    // Nettoyer l'URL de l'image supprimée
    const urlToRevoke = previewUrls.get(index);
    if (urlToRevoke) {
      URL.revokeObjectURL(urlToRevoke);
    }
    
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => {
      const newUrls = new Map(prev);
      newUrls.delete(index);
      // Réindexer les URLs restantes
      const reindexed = new Map<number, string>();
      files.forEach((file, i) => {
        if (i !== index && i < files.length) {
          const oldIndex = i > index ? i - 1 : i;
          if (prev.has(oldIndex)) {
            reindexed.set(i > index ? i - 1 : i, prev.get(oldIndex)!);
          }
        }
      });
      return reindexed;
    });
  };

  // Nettoyer les URLs et la caméra lors du démontage
  useEffect(() => {
    return () => {
      // Nettoyer la caméra
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
      // Nettoyer les URLs d'objets (sera fait lors du submit ou unmount)
    };
  }, [cameraStream]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Nouvel Inventaire</h1>

      {/* Boutons d'action rapide pour mobile */}
      {isMobile && (
        <div className="flex gap-4 mb-6">
          <button
            onClick={openCamera}
            className="btn btn-primary flex-1"
            disabled={isCameraOpen}
          >
            <FontAwesomeIcon icon={faCamera} className="mr-2" />
            Prendre une photo
          </button>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCameraFileSelect}
            className="hidden"
          />
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="btn btn-secondary flex-1"
          >
            <FontAwesomeIcon icon={faImage} className="mr-2" />
            Galerie
          </button>
        </div>
      )}

      {/* Vue caméra */}
      {isCameraOpen && (
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title mb-4">
              <FontAwesomeIcon icon={faCamera} className="mr-2" />
              Caméra
            </h2>
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-auto max-h-[60vh]"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            <div className="flex gap-4 justify-end mt-4">
              <button onClick={closeCamera} className="btn btn-ghost">
                Annuler
              </button>
              <button onClick={capturePhoto} className="btn btn-primary">
                <FontAwesomeIcon icon={faCamera} className="mr-2" />
                Prendre la photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Zone de drop/upload */}
      <div className="card bg-base-200 border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors mb-6">
        <div
          {...getRootProps()}
          className="card-body items-center justify-center min-h-[300px] cursor-pointer"
          onClick={(e) => {
            // Ensure clicks on the dropzone area trigger file picker
            const target = e.target as HTMLElement;
            if (target.tagName !== 'BUTTON' && target.closest('button') === null) {
              e.stopPropagation();
              open();
            }
          }}
        >
          <input {...getInputProps()} />
          <FontAwesomeIcon
            icon={faUpload}
            className="text-6xl text-primary mb-4"
          />
          <h3 className="card-title text-xl mb-2">
            {isDragActive ? 'Déposez les images ici' : 'Glissez vos images ici'}
          </h3>
          <p className="text-base-content/70 text-center mb-4">
            {isMobile
              ? 'Ou utilisez les boutons ci-dessus pour la caméra'
              : 'Ou cliquez pour sélectionner des fichiers'}
          </p>
          <p className="text-xs text-base-content/50 mt-2">
            Formats supportés: JPG, PNG, WEBP (max 10MB)
          </p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              open();
            }}
            className="btn btn-primary btn-sm mt-4"
          >
            <FontAwesomeIcon icon={faImage} className="mr-2" />
            Sélectionner des fichiers
          </button>
        </div>
      </div>

      {files.length > 0 && (
        <div className="card bg-base-100 shadow-md mb-6">
          <div className="card-body">
            <h2 className="card-title mb-4">
              <FontAwesomeIcon icon={faImage} className="mr-2" />
              Images sélectionnées ({files.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {files.map((file, index) => {
                const previewUrl = previewUrls.get(index);
                return (
                  <div key={index} className="relative group">
                    {previewUrl && (
                      <img
                        src={previewUrl}
                        alt={file.name}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    )}
                    <button
                      className="absolute top-2 right-2 btn btn-sm btn-error btn-circle opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeFile(index)}
                    >
                      ×
                    </button>
                    <p className="text-xs text-center mt-1 truncate">{file.name}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4 justify-end">
        <a href="/" className="btn btn-ghost">
          Annuler
        </a>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={uploading || files.length === 0}
        >
          {uploading ? (
            <>
              <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
              Traitement...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faUpload} className="mr-2" />
              Créer l'inventaire
            </>
          )}
        </button>
      </div>
    </div>
  );
}
