import { FunctionComponent, useState, useRef, useEffect } from 'react';
import { useNavigation } from '@remix-run/react';
import { LinearProgress } from '@mui/material';
import useInterval from '../hooks/useInterval';

const GlobalLoadingIndicator: FunctionComponent = () => {
  const navigation = useNavigation();
  const active = navigation.state !== 'idle';
  const [currentProgress, setCurrentProgress] = useState(0);

  const ref = useRef<HTMLDivElement>(null);
  const [animationComplete, setAnimationComplete] = useState(true);

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    if (active) {
      setAnimationComplete(false);
    }

    Promise.allSettled(
      ref.current.getAnimations().map(({ finished }) => finished),
    ).then(() => !active && setAnimationComplete(true));
  }, [active]);

  const isHidden = navigation.state === 'idle' && animationComplete;

  useEffect(() => {
    const computeProgress = () => {
      switch (navigation.state) {
        case 'submitting':
          return 30;
        case 'loading':
          return 80;
        case 'idle':
          return animationComplete ? 0 : 100;
        default:
          return 0;
      }
    };

    setCurrentProgress(computeProgress());
  }, [navigation.state, animationComplete]);

  useInterval(
    () => {
      setCurrentProgress(previousProgress =>
        Math.min(previousProgress + 1, 100),
      );
    },
    isHidden ? null : 500,
  );

  return (
    <LinearProgress
      variant="determinate"
      color="secondary"
      value={currentProgress}
      aria-hidden={isHidden}
      sx={{ opacity: isHidden ? 0 : 1, transition: 'opacity .4s' }}
    />
  );
};

export default GlobalLoadingIndicator;
