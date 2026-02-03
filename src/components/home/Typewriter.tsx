'use client'

import { useEffect, useState } from 'react'

interface TypewriterProps {
    words: string[]
    typingSpeed?: number
    deletingSpeed?: number
    pauseDuration?: number
}

export function Typewriter({
    words,
    typingSpeed = 50,
    deletingSpeed = 30,
    pauseDuration = 2000,
}: TypewriterProps) {
    const [displayText, setDisplayText] = useState('')
    const [wordIndex, setWordIndex] = useState(0)
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        const currentWord = words[wordIndex]

        const timeout = setTimeout(() => {
            if (!isDeleting) {
                // Typing
                setDisplayText(currentWord.substring(0, displayText.length + 1))

                // Finished typing word
                if (displayText === currentWord) {
                    setTimeout(() => setIsDeleting(true), pauseDuration)
                    return
                }
            } else {
                // Deleting
                setDisplayText(currentWord.substring(0, displayText.length - 1))

                // Finished deleting word
                if (displayText.length === 0) {
                    setIsDeleting(false)
                    setWordIndex((prev) => (prev + 1) % words.length)
                    return
                }
            }
        }, isDeleting ? deletingSpeed : typingSpeed)

        return () => clearTimeout(timeout)
    }, [displayText, isDeleting, wordIndex, words, typingSpeed, deletingSpeed, pauseDuration])

    return (
        <span className="inline-block relative">
            {displayText}
            <span className="animate-blink border-r-4 border-primary ml-1 h-[1em] inline-block align-middle">&nbsp;</span>
        </span>
    )
}
