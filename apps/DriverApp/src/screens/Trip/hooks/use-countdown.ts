import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { useEffect, useState } from 'react';
import { queryClient } from '@/App';

dayjs.extend(duration);

export const useCountdown = (initialMilliseconds: number, tripId: string) => {
  const [timeLeft, setTimeLeft] = useState(initialMilliseconds);

  useEffect(() => {
    setTimeLeft(initialMilliseconds);
  }, [initialMilliseconds]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          return 0;
        }
        const next = Math.max(0, prev - 1000);
        if (next === 0) {
          queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [tripId]);

  const dur = dayjs.duration(timeLeft);
  const hours = Math.floor(dur.asHours());
  const minutes = dur.minutes();
  const seconds = dur.seconds();

  return { hours, minutes, seconds, timeLeft };
};
