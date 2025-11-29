import Image from 'next/image';

const Logo = ({ src = '/logo.jpg', alt = 'DISHA Logo', width = 200, height = 200, priority = true }) => {
  if (!src || !alt) {
    console.error('Missing src or alt for Logo component');
    return null;
  }

  return (
    <Image 
      src={src} 
      alt={alt} 
      width={width} 
      height={height} 
      priority={priority} 
    />
  );
};

export default Logo;
