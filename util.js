exports.arrayToDic = (arr, key) => {
  const obj = {};
  arr.forEach((ele) => {
    obj[ele[key]] = ele;
  });
  return obj;
};
