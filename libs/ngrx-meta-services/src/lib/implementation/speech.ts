export const speak = (text: string) => {
    if (text) {
        const utterance = new SpeechSynthesisUtterance(text);

        speechSynthesis.speak(utterance);
    }
}