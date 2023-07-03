export function generateDataTestPrettyName(text: string) {
  return (text || '').toLowerCase().replace(/\s+/g, '-').replace(/[^\da-z-]/gi, '');
}


// moves an item in an array from one index to another.
// can also move with negative indexes, eg move to second last
// position (an index of -2).
export function moveInArray(arr: Array<any>, old_index: number, new_index: number): Array<any> {
  let arrCopy = [...arr]
  while (old_index < 0) {
    old_index += arrCopy.length
  }
  
  while (new_index < 0) {
    new_index += arrCopy.length
  }

  if (new_index >= arrCopy.length) {
    let k = new_index - arrCopy.length + 1
    while (k--) {
      arrCopy.push(undefined)
    }
  }

  arrCopy.splice(new_index, 0, arrCopy.splice(old_index, 1)[0])
  return arrCopy
};