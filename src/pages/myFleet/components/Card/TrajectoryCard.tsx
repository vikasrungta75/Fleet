import React, { useEffect, useRef } from "react";

const TrajectoryCard = ({ startPoint, endPoint, startIconSrc, endIconSrc, color, height }: any) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas : any = canvasRef.current;
    const ctx = canvas.getContext("2d");

      // Draw the start icon
      const startIcon = new Image();
      startIcon.src = startIconSrc;
      startIcon.onload = () => {
        const x = 0;
        const y = 0;
        ctx.drawImage(startIcon, x, y);
      };
  
      // Draw the end icon
      const endIcon = new Image();
      endIcon.src = endIconSrc;
      endIcon.onload = () => {
        const x = 0;
        const y = canvas.height-15;
        ctx.drawImage(endIcon, x, y);
      };
      

    ctx.beginPath();
    ctx.moveTo(startIcon.width + 7, startIcon.height + 10);
    ctx.lineTo(endIcon.width + 7, (canvas.height - endIcon.height - 10));
    ctx.strokeStyle = color; 
    ctx.lineWidth = 2
    ctx.stroke();

   
  }, [startIconSrc, endIconSrc, color, height]);

  return (<canvas ref={canvasRef} width="20" height={height} style={{marginRight: 10, marginBottom: 10}} />
     
  );
};

export default TrajectoryCard;