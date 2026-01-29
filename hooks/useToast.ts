import { useState, useCallback } from "react";
import { type ToastType } from "@/components/ui/Toast";

type ToastState = {
  visible: boolean;
  message: string;
  type: ToastType;
};

type UseToastReturn = {
  toast: ToastState;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
};

/**
 * Hook for managing toast notifications
 */
export function useToast(): UseToastReturn {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: "",
    type: "info",
  });

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    setToast({
      visible: true,
      message,
      type,
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({
      ...prev,
      visible: false,
    }));
  }, []);

  const showError = useCallback(
    (message: string) => showToast(message, "error"),
    [showToast]
  );

  const showSuccess = useCallback(
    (message: string) => showToast(message, "success"),
    [showToast]
  );

  const showInfo = useCallback(
    (message: string) => showToast(message, "info"),
    [showToast]
  );

  const showWarning = useCallback(
    (message: string) => showToast(message, "warning"),
    [showToast]
  );

  return {
    toast,
    showToast,
    hideToast,
    showError,
    showSuccess,
    showInfo,
    showWarning,
  };
}

export default useToast;
