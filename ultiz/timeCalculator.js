export function timeCalculator(time) {
  const hour = Math.floor(time / 3600);
  const minute =
    hour > 0 ? Math.floor((time - hour * 3600) / 60) : Math.floor(time / 60);
  const second = Math.floor(time % 60);
  const dataTime = { hour: hour, minute: minute, second: second };
  return dataTime;
}
