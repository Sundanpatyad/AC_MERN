import { useState, useEffect } from 'react'
import { X, Download } from 'lucide-react'

export default function InstallApp() {
  const [isVisible, setIsVisible] = useState(true)
  const [deferredPrompt, setDeferredPrompt] = useState(null);


  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 50000) // Auto dismiss after 5 seconds
    return () => clearTimeout(timer)
  }, [])


  const handleClose = () => {
    setIsVisible(false)
  }


  
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
        setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
    };
}, []);


const handleInstall = () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the A2HS prompt');
            } else {
                console.log('User dismissed the A2HS prompt');
            }
            setDeferredPrompt(null);
            setIsVisible(false)
        });
    } else {
        console.log('Deferred prompt is null');
    }
};


  if (!isVisible) return null

  return (
    <div className="fixed bottom-16 lg:bottom-4 lg:left-4 z-40 w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg p-4 flex items-start space-x-4">
      <div className="flex-shrink-0">
        <Download className="w-6 h-6 text-zinc-500 dark:text-zinc-400" />
      </div>
      <div className="flex-1">
        <h3 className="text-zinc-900 dark:text-white font-medium">Install Our App</h3>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">Get the best experience on your device!</p>
      </div>
      <div className="flex-shrink-0 flex space-x-2">
        <button
          onClick={handleInstall}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1 px-3 rounded-lg"
        >
          Install
        </button>
        <button
          onClick={handleClose}
          className="flex items-center justify-center p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700"
        >
          <X className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
        </button>
      </div>
    </div>
  )
}
