import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import moment from 'moment';

const formatString = (n, str) => {
  const pluralStr = n > 1 ? `${str}s` : str;
  return n > 0 ? `${n} ${pluralStr}` : '';
}

const formatCountdown = (timer) => {
  const { hours, mins, secs, total } = timer;
  const h = formatString(hours, 'hour');
  const m = formatString(mins, 'minute');
  const s = formatString(secs, 'second');
  return total > 1 ? `FREE Delivery, Next day if ordered within ${h} ${m} ${s}` : 'Loading...';
}

const countdownDate = ({ cutOffDate }) => {
  const difference = moment(cutOffDate).diff(moment(), 'millseconds');
  const duration = moment.duration(difference);
  return {
    hours: duration.hours(),
    mins: duration.minutes(),
    secs: duration.seconds(),
    total: difference,
    cutOffDate
  };
}

const baseUrl = 'https://express-api-for-react-timer.rolandjlevy.repl.co/cutoff';

const Countdown = () => {
  const countdownRunning = useRef(false);
  const timerRef = useRef(null);
  const [timer, setTimer] = useState({ total: 1 });
  const [loopDuration, setLoopDuration] = useState(0.5);

  const handleClick = (e, seconds) => {
    e.preventDefault();
    setLoopDuration(seconds);
    setTimer({ total: 1 });
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
      {timer.total > 0 ?
        (<section>
          <p>
            <a href="#" onClick={(e) => handleClick(e, 0.5)}>0.5 mins</a>&nbsp;|&nbsp; 
            <a href="#" onClick={(e) => handleClick(e, 2)}>2 mins</a>&nbsp;|&nbsp;  
            <a href="#" onClick={(e) => handleClick(e, 90)}>90 mins</a>
          </p>
          <p>{formatCountdown(timer)}</p>
          <p>{JSON.stringify(timer)}</p>
        </section>) : 
        (<section>
          <a href="#" onClick={(e) => handleClick(e, 5)}>Estimated delivery dates have changed. Get updated dates</a>
        </section>)}
    </main>
  );
}

export default Countdown;