import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

export const useTripTimer = () => {
  const [now, setNow] = useState(dayjs());

  useEffect(() => {
    const timer = setInterval(() => setNow(dayjs()), 60_000);
    return () => clearInterval(timer);
  }, []);

  return now;
};
