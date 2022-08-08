/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
	if (!string || size === 0)
		return '';
	if (!size)
		return string;
	let newString = '';
	let prevChar = '';
	let currentCharCount = 0;
	for (let i = 0; i < string.length; i++) {
		if (string[i] !== prevChar)
			currentCharCount = 0;
		if (currentCharCount < size) {
			newString += string[i];
			currentCharCount++;
			prevChar = string[i];
		}
	}
	return newString;
}

