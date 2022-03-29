# Notes

```js
const query = new URLSearchParams(window.location.search);
const loopDuration = query.get('loopDuration') || 0.5;
```