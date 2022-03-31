import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

import { formatCountdown, countdownDate } from './utils';

const Content = ({ timer, handleClick }) => (
  timer.total > 0 ?
    (<section>
      <p>
        {[0.05, 0.5, 2, 15, 90, 600].map((item, index, array) => {
          const delimeter = index < array.length-1 ? ' ~ ' : '';
          return <><a href="#" onClick={(e) => handleClick(e, item)}>{item} mins</a>{delimeter}</>})}
      </p>
      <p>{formatCountdown(timer)}</p>
      <p>{JSON.stringify(timer)}</p>
    </section>) : 
    (<section>
      <a href="#" onClick={(e) => handleClick(e, 0.5)}>Estimated delivery dates have changed. Get updated dates</a>
    </section>));

const Countdown = () => {
  const countdownRunning = useRef(false);
  const timerRef = useRef(null);
  const [timer, setTimer] = useState({ total: 0 });
  const [loopDuration, setLoopDuration] = useState(0.5);

  const handleClick = (e, seconds) => {
    e.preventDefault();
    setLoopDuration(seconds);
    setTimer({ total: 0 });
    countdownRunning.current = false;
  }

  useEffect(() => {
    if (timer.total > 0) {
      timerRef.current = setTimeout(() => {
        const countDown = countdownDate({ cutOffDate: timer.cutOffDate });
        setTimer(countDown);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [JSON.stringify(timer)]);
  
  useEffect(async () => {
    const source = axios.CancelToken.source();
    if (!countdownRunning.current) {
      try {
        const options = { cancelToken: source.token };
        const url = `${API_URL}?loopDuration=${loopDuration}`;
        const { data } = await axios.get(url, options);
        const countdown = countdownDate({ cutOffDate: data.time });
        setTimer(countdown);
        countdownRunning.current = true;
      } catch (error) {
        if (axios.isCancel(error)) return;
      }
    }
    return () => source.cancel();
  }, [JSON.stringify(timer)]);

  return (
    <main className="container">
      {countdownRunning.current ?
      (<Content 
        timer={timer} 
        handleClick={handleClick}
      />) : (<section>Loading next countdown...</section>)}
    </main>
  );
}

export default Countdown;