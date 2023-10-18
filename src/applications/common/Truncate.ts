/**
 * Truncates a multi-word string to a maximum length, optionally truncating each word that exceeds a specified length
 *
 * @param string - The string to truncate
 * @param maxLength - The maximum length of the string
 * @param maxWordLength - The maximum length of a word in the string
 */
export default function (string: string, maxLength: number = 12, maxWordLength?: number) {
    if (!string || maxLength <= 0 || maxWordLength <= 0) {
        return "";
    }
    const words = string.split(" ");
    const truncationCharacters = `...`;
    const processedWords: string[] = [];
    let length = 0;

    // truncate each word longer than the max word length if specified and add to processed words
    // otherwise, if the total length of the string exceeds the max length, truncate the word to the max string length
    // and add to processed words. If the total length of the string does not exceed the max length, add the word to
    // processed words
    for (const word of words) {
        if (maxWordLength && word.length > maxWordLength) {
            processedWords.push(word.substring(0, maxWordLength) + truncationCharacters);
            length += maxWordLength + truncationCharacters.length;
        } else if (length + word.length > maxLength) {
            processedWords.push(word.substring(0, maxLength - length) + truncationCharacters);
            length = maxLength;
            break;
        } else {
            processedWords.push(word);
            length += word.length;
        }
    }

    return processedWords.join(" ");
}