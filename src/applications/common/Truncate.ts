export default function (string: string, maxLength: number) {
    if (!string || string?.length <= maxLength) {
        return string;
    }
    const lastWhitespaceIndex = string.lastIndexOf(" ");
    const lastWordTerminationIndex = lastWhitespaceIndex >= 0 ? lastWhitespaceIndex : string.length;
    if (lastWordTerminationIndex > maxLength) {
        return `${string.substring(0, maxLength)}...`;
    }
    return `${string.substring(0, lastWordTerminationIndex)}...`;
}