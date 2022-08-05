/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
	let arrToSort = [...arr];
	arrToSort.sort((a, b) => {
		if (param === 'asc')
			return a.normalize().localeCompare(b.normalize(), ['ru', 'en'], { caseFirst: 'upper' });
		else
			return b.normalize().localeCompare(a.normalize(), ['ru', 'en'], { caseFirst: 'upper' });
	});
	return arrToSort;
}
