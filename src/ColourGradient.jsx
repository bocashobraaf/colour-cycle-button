import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { createNoise2D } from 'simplex-noise';

const ColourGradient = (props) => {
  const canvasRef = useRef(null);
  const noise2D = createNoise2D();
  const gradientAnimationRef = useRef(null);

  useEffect(() => {
    if (props.dominantColors && props.dominantColors.length === 5) {
      gradientAnimationRef.current = new GradientAnimation(canvasRef.current, props);
      return () => {
        if (gradientAnimationRef.current) {
          gradientAnimationRef.current.stop();
        }
      };
    } else {
      console.log('No dominant colors provided');
    }
  }, [props.dominantColors]);

  useEffect(() => {
    if (gradientAnimationRef.current && props.transitionStarted) {
      gradientAnimationRef.current.startTransition();
    }
  }, [props.transitionStarted]);

  useEffect(() => {
    if (props.backgroundColor) {
      canvasRef.current.style.background = props.backgroundColor;
    }
  }, [props.backgroundColor, props.transitionStarted]);

  useEffect(() => {
    if (props.onLoad) {
      props.onLoad();
    }
  }, [props.onLoad]);

  class GradientAnimation {
    constructor(canvas, props) {
      this.cnv = canvas;
      this.ctx = this.cnv.getContext('2d');
      this.props = props;

      this.circlesNum = props.isWideScreen ? 20 : 15;
      this.minRadius = props.isWideScreen ? 2000 : 600;
      this.maxRadius = props.isWideScreen ? 2500 : 700;

      this.speed = props.page === 'scout' ? 0.003 : 0.001;

      this.setCanvasSize();
      this.createCircles();

      this.fadeDuration = 4000;
      this.fadeDelay = 200;

      this.transitionStarted = false;
      this.transitionStartTime = null;

      this.handleResize = this.handleResize.bind(this);
      window.addEventListener('resize', this.handleResize);

      this.animationFrameId = null;
      this.drawAnimation();
    }

    setCanvasSize() {
      this.w = this.cnv.width = window.innerWidth * devicePixelRatio;
      this.h = this.cnv.height = window.innerHeight * devicePixelRatio;
      this.ctx.scale(devicePixelRatio, devicePixelRatio);
    }

    handleResize() {
      this.setCanvasSize();
    }

    createCircles() {
      this.circles = [];
      for (let i = 0; i < this.circlesNum; ++i) {
        this.circles.push(
          new Circle(
            this.w,
            this.h,
            this.minRadius,
            this.maxRadius,
            this.props.dominantColors,
            noise2D,
            i,
            this.fadeDelay,
            this.fadeDuration
          )
        );
      }
    }

    startTransition() {
      if (this.transitionStarted) {
        return;
      }
      this.transitionStarted = true;
      console.log('The transition has begun');
      this.transitionStartTime = performance.now();
      this.circles.forEach((circle, index) => {
        circle.fadeStartTime = this.transitionStartTime + index * this.fadeDelay;
        console.log(`Circle ${index} fadeStartTime: ${circle.fadeStartTime}`);
      });
    }

    drawAnimation() {
      const animateFrame = (currentTime) => {
        this.clearCanvas();
        this.drawCircles(currentTime);

        if (!document.hidden) {
          this.animationFrameId = window.requestAnimationFrame(animateFrame);
        }
      };

      this.animationFrameId = window.requestAnimationFrame(animateFrame);
    }

    drawCircles(currentTime) {
      this.circles.forEach((circle) => {
        circle.draw(this.ctx, this.speed, currentTime);
      });
    }

    clearCanvas() {
      this.ctx.clearRect(0, 0, this.w, this.h);
    }

    stop() {
      if (this.animationFrameId) {
        window.cancelAnimationFrame(this.animationFrameId);
      }
      window.removeEventListener('resize', this.handleResize);
    }
  }

  class Circle {
    constructor(w, h, minR, maxR, colors, noise, index, fadeDelay, fadeDuration) {
      this.x = Math.random() * w * 0.8 + w * 0.1;
      this.y = Math.random() * h * 0.8 + h * 0.1;
      this.angle = Math.random() * Math.PI * 2;
      this.radius = Math.random() * (maxR - minR) + minR;
      this.noise = noise;
      this.firstColor = colors[0] || `hsla(${Math.random() * 360}, 100%, 50%, 1)`;
      this.secondColor = colors[1] || `hsla(${Math.random() * 360}, 100%, 50%, 1)`;
      this.thirdColor = colors[2] || `hsla(${Math.random() * 360}, 100%, 50%, 1)`;
      this.fourthColor = colors[3] || `hsla(${Math.random() * 360}, 100%, 50%, 1)`;
      this.fifthColor = colors[4] || `hsla(${Math.random() * 360}, 100%, 50%, 1)`;
      this.blobbiness = Math.random() * 0.5 + 0.1;
      this.time = Math.random() * 1000;
      this.index = index;
      this.fadeDelay = fadeDelay;
      this.fadeStartTime = null;
      this.fadeDuration = fadeDuration;
    }

    draw(ctx, speed, currentTime) {
      this.angle += speed;
      this.time += speed * 100;

      const x = this.x + Math.cos(this.angle) * 200;
      const y = this.y + Math.sin(this.angle) * 200;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, this.radius);
      this.angle += speed;
      gradient.addColorStop(0, this.firstColor);
      gradient.addColorStop(0.25, this.secondColor);
      gradient.addColorStop(0.5, this.thirdColor);
      gradient.addColorStop(0.75, this.fourthColor);
      gradient.addColorStop(1, this.fifthColor);

      let opacity = 1;
      if (this.fadeStartTime !== null && currentTime >= this.fadeStartTime) {
        const elapsed = currentTime - this.fadeStartTime;
        if (elapsed < this.fadeDuration) {
          const t = Math.min(elapsed / this.fadeDuration, 1);
          opacity = 1 - this.easeOutCubic(t);
        } else {
          opacity = 0;
        }
      }

      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = opacity;
      ctx.fillStyle = gradient;

      const circlePoints = 200;
      ctx.beginPath();
      for (let i = 0; i < circlePoints; i++) {
        const angle = (Math.PI * 2) / circlePoints * i + this.angle;
        const noiseValue = this.noise(
          this.x * 0.005 + Math.cos(angle),
          this.y * 0.005 + Math.sin(angle) + this.time * 0.001
        );
        const r = this.radius + noiseValue * this.radius * this.blobbiness;
        ctx.lineTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
      }
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }
  }

  return (
    <motion.canvas
      ref={canvasRef}
      className="colourBodyGradientCanvas"
      style={{
        opacity: props.visible ? 1 : 0,
        background: props.transitionStarted ? props.backgroundColor : '#FFFFFF'
      }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    />
  );
};

export default ColourGradient;
