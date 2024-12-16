"use client"; // Ensure this is a client component

import Lottie from 'lottie-react';
import { useEffect, useState } from 'react';

const LottieComponent = ({ animationPath }) => {
    const [animationData, setAnimationData] = useState(null);
  
    useEffect(() => {
      const loadAnimationData = async () => {
        const response = await fetch(animationPath);
        const data = await response.json();
        setAnimationData(data);
      };
  
      loadAnimationData();
    }, [animationPath]);
  
    if (!animationData) {
      return null; // or a loading spinner
    }
  
    return (
      <Lottie 
        animationData={animationData} 
        loop={true}
        autoplay={true}
      />
    );
  };
  

export default LottieComponent;
