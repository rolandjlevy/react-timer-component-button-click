import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import moment from 'moment';

const formatString = (n, str) => {
  const pluralStr = n > 1 ? `${str}s` : str;
  return n > 0 ? `${n} ${pluralStr}` : '';
}

const formatCountdown = (timer) => {
  const { hours, minutes, seconds, total } = timer;
  const h = formatString(hours, 'hour');
  const m = formatString(minutes, 'minute');
  const s = formatString(seconds, 'second');
  return total > 0 ? `FREE Delivery, Next day if ordered within ${h} ${m} ${s}` : 'Loading...';
}

const countdownDate = ({ cutOffDate }) => {
  const difference = moment(cutOffDate).diff(moment(), 'millseconds');
  const duration = moment.duration(difference);
  return {
    hours: duration.hours(),
    minutes: duration.minutes(),
    seconds: duration.seconds(),
    total: difference,
    cutOffDate
  };
}

const baseUrl = 'https://express-api-for-react-timer.rolandjlevy.repl.co/cutoff';

const Content = ({ timer, handleClick, formatCountdown }) => (
  timer.total > 0 ?
    (<section>
      <p>
        {[0.5, 2, 15, 90, 600].map((item, index, array) => {
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
        const url = `${baseUrl}?loopDuration=${loopDuration}`;
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
        formatCountdown={formatCountdown}
      />) : (<section>Loading next countdown...</section>)}
    </main>
  );
}

export default Countdown;