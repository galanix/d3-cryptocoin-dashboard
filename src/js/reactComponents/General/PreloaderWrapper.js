import React from 'react';

import CubePreloader from './CubePreloader';

export default function PreloaderWrapper(props) {
  return (
    <div className="preloader-wrapper" >
      {props.isPreloaderShown ?
        <div>
          <div className="preloader-wrapper__bg-cover" />
          <CubePreloader />
        </div>
        :
        null
      }
      {props.children}
    </div>
  );
}
