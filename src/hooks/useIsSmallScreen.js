import { useEffect, useState } from 'react';

export default function useIsSmallScreen(breakpoint = 768) {
  const [isSmall, setIsSmall] = useState(() => typeof window !== 'undefined' ? window.innerWidth <= breakpoint : false);
  useEffect(() => {
    function onResize() { setIsSmall(window.innerWidth <= breakpoint); }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);
  return isSmall;
}
