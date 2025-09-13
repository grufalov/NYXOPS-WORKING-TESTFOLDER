import React from 'react';

// Import decorative SVGs
import doodle1 from '../../assets/decors/doodle1.svg';
import doodle2 from '../../assets/decors/doodle2.svg';
import doodle3 from '../../assets/decors/doodle3.svg';
import doodle4 from '../../assets/decors/doodle4.svg';
import doodle5 from '../../assets/decors/doodle5.svg';
import doodleBurst from '../../assets/decors/doodle-burst.svg';
import doodleLines from '../../assets/decors/doodle-lines.svg';
import doodleSpark from '../../assets/decors/doodle-spark.svg';
import doodleTriangleBubble from '../../assets/decors/doodle-triangle-bubble.svg';

const BackgroundDoodles = () => {
  return (
    <>
      {/* Background doodle decorations */}
      {/* Strategically placed doodles with 30px minimum spacing and variety */}
      
      {/* Top row - spaced across header area */}
      <img 
        src={doodle1} 
        alt="" 
        className="decor decor--doodle-top-left" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodleBurst} 
        alt="" 
        className="decor decor--doodle-top-center" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodle3} 
        alt="" 
        className="decor decor--doodle-top-right" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodleLines} 
        alt="" 
        className="decor decor--doodle-top-far-left" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodle5} 
        alt="" 
        className="decor decor--doodle-top-far-right" 
        role="presentation"
        aria-hidden="true"
      />
      
      {/* Upper middle row */}
      <img 
        src={doodleLines} 
        alt="" 
        className="decor decor--doodle-upper-left" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodle5} 
        alt="" 
        className="decor decor--doodle-upper-right" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodleSpark} 
        alt="" 
        className="decor decor--doodle-upper-center" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodle2} 
        alt="" 
        className="decor decor--doodle-upper-far-left" 
        role="presentation"
        aria-hidden="true"
      />
      
      {/* Middle row */}
      <img 
        src={doodle2} 
        alt="" 
        className="decor decor--doodle-middle-left" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodleSpark} 
        alt="" 
        className="decor decor--doodle-middle-center" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodle4} 
        alt="" 
        className="decor decor--doodle-middle-right" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodleTriangleBubble} 
        alt="" 
        className="decor decor--doodle-middle-far-left" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodleBurst} 
        alt="" 
        className="decor decor--doodle-middle-far-right" 
        role="presentation"
        aria-hidden="true"
      />
      
      {/* Lower middle row */}
      <img 
        src={doodleTriangleBubble} 
        alt="" 
        className="decor decor--doodle-lower-left" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodle1} 
        alt="" 
        className="decor decor--doodle-lower-center" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodleLines} 
        alt="" 
        className="decor decor--doodle-lower-right" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodle4} 
        alt="" 
        className="decor decor--doodle-lower-far-left" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodleSpark} 
        alt="" 
        className="decor decor--doodle-lower-far-right" 
        role="presentation"
        aria-hidden="true"
      />
      
      {/* Bottom row */}
      <img 
        src={doodle3} 
        alt="" 
        className="decor decor--doodle-bottom-left" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodleBurst} 
        alt="" 
        className="decor decor--doodle-bottom-center" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodle5} 
        alt="" 
        className="decor decor--doodle-bottom-right" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodle2} 
        alt="" 
        className="decor decor--doodle-bottom-far-left" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodleTriangleBubble} 
        alt="" 
        className="decor decor--doodle-bottom-far-right" 
        role="presentation"
        aria-hidden="true"
      />
      
      {/* Accent positions - fill remaining strategic spaces */}
      <img 
        src={doodleSpark} 
        alt="" 
        className="decor decor--doodle-accent-1" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodle2} 
        alt="" 
        className="decor decor--doodle-accent-2" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodleTriangleBubble} 
        alt="" 
        className="decor decor--doodle-accent-3" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodle4} 
        alt="" 
        className="decor decor--doodle-accent-4" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodle1} 
        alt="" 
        className="decor decor--doodle-accent-5" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodleLines} 
        alt="" 
        className="decor decor--doodle-accent-6" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodle3} 
        alt="" 
        className="decor decor--doodle-accent-7" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodleBurst} 
        alt="" 
        className="decor decor--doodle-accent-8" 
        role="presentation"
        aria-hidden="true"
      />
      
      {/* Extended scroll doodles for long content */}
      <img 
        src={doodle1} 
        alt="" 
        className="decor decor--doodle-scroll-1" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodleSpark} 
        alt="" 
        className="decor decor--doodle-scroll-2" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodle2} 
        alt="" 
        className="decor decor--doodle-scroll-3" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodle3} 
        alt="" 
        className="decor decor--doodle-scroll-4" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodle4} 
        alt="" 
        className="decor decor--doodle-scroll-5" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodleLines} 
        alt="" 
        className="decor decor--doodle-scroll-6" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodleBurst} 
        alt="" 
        className="decor decor--doodle-scroll-7" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodleTriangleBubble} 
        alt="" 
        className="decor decor--doodle-scroll-8" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodle1} 
        alt="" 
        className="decor decor--doodle-scroll-9" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodle2} 
        alt="" 
        className="decor decor--doodle-scroll-10" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodle3} 
        alt="" 
        className="decor decor--doodle-scroll-11" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodle4} 
        alt="" 
        className="decor decor--doodle-scroll-12" 
        role="presentation"
        aria-hidden="true"
      />
      
      {/* Additional doodles to double the amount */}
      <img 
        src={doodleSpark} 
        alt="" 
        className="decor decor--doodle-extra-1" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodle1} 
        alt="" 
        className="decor decor--doodle-extra-2" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodle2} 
        alt="" 
        className="decor decor--doodle-extra-3" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodle3} 
        alt="" 
        className="decor decor--doodle-extra-4" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodle4} 
        alt="" 
        className="decor decor--doodle-extra-5" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodleLines} 
        alt="" 
        className="decor decor--doodle-extra-6" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodleBurst} 
        alt="" 
        className="decor decor--doodle-extra-7" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodleTriangleBubble} 
        alt="" 
        className="decor decor--doodle-extra-8" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodle1} 
        alt="" 
        className="decor decor--doodle-extra-9" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodleSpark} 
        alt="" 
        className="decor decor--doodle-extra-10" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodle2} 
        alt="" 
        className="decor decor--doodle-extra-11" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodle3} 
        alt="" 
        className="decor decor--doodle-extra-12" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodle4} 
        alt="" 
        className="decor decor--doodle-extra-13" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodleLines} 
        alt="" 
        className="decor decor--doodle-extra-14" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodleBurst} 
        alt="" 
        className="decor decor--doodle-extra-15" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodleTriangleBubble} 
        alt="" 
        className="decor decor--doodle-extra-16" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodle1} 
        alt="" 
        className="decor decor--doodle-extra-17" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodleSpark} 
        alt="" 
        className="decor decor--doodle-extra-18" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodle2} 
        alt="" 
        className="decor decor--doodle-extra-19" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodle3} 
        alt="" 
        className="decor decor--doodle-extra-20" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodle4} 
        alt="" 
        className="decor decor--doodle-extra-21" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodleLines} 
        alt="" 
        className="decor decor--doodle-extra-22" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodleBurst} 
        alt="" 
        className="decor decor--doodle-extra-23" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodleTriangleBubble} 
        alt="" 
        className="decor decor--doodle-extra-24" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodle1} 
        alt="" 
        className="decor decor--doodle-extra-25" 
        role="presentation"
        aria-hidden="true"
      />
      <img 
        src={doodleSpark} 
        alt="" 
        className="decor decor--doodle-extra-26" 
        role="presentation"
        aria-hidden="true"
      />
    </>
  );
};

export default BackgroundDoodles;
