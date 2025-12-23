function compareTime(t1, t2) {
  const d1 = new Date(t1);
  const d2 = new Date(t2);

  const epochTimeT1 = d1.getTime();
  const epochTimeT2 = d2.getTime();

  return epochTimeT1 < epochTimeT2;
}

module.exports = {
  compareTime,
};
