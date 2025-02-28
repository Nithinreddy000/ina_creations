import { useEffect, useRef, useState } from "react";

export const useIsVisible = (options = {}, once = false) => {
  const [isVisible, setIsVisible] = useState(false);
  const targetRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(entry.target);
            observer.disconnect();
          }
        } else {
          setIsVisible(false);
        }
      });
    }, {
      root: null,
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    });

    const currentTarget = targetRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
      observer.disconnect();
    };
  }, [options, once]);

  return { isVisible, targetRef };
}; 