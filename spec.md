This is a learning app, copied over from another project.
See `README.md` and `developer-guidelines.md` for general contexts.

This template contains many useful parts, but we want to use it to build something different.
Here are the differences:


The original app assumes data files that stand for specific situations, with two files per situation and bespoke reading-in logic.
We have much simpler data.
It's still essentially `gloss.schema.json` `Gloss`, but overall much simpler.
We still have the `native_lang/target_lang` folder structure, albeit in `public/infinite-sentences-data/` now.
However, what is in these folders is different:
Each file is a foreign language sentence to practice, this is essentially equivalent to what's called an understanding goal in the legacy paradigm.
There is nothing like a paraphrased expression goal in this app (you can REMOVE, yes REMOVE, not comment out or "leave for legacy" all references to that).  

Now, on to the files, each target_lang folder contains files like `public/infinite-sentences-data/eng/ita/5.json` (example content attached to end of this file).

As you can see, in the legacy code, we have code structure to pick "situations" per language combination.
This is no longer needed.
Instead, practice begins as soon as the user selects a native and then a target language.
The practice should no longer happen in lessons that end, but instead be infinite.

The loop should be as follows:
1. Pick *two* random sentences to practice from the relevant folder
    - JSON files are simply numbered continously from 0 up
    - an index.txt file in each iso/iso folder shows up to which index the files in a given folder go (example `public/infinite-sentences-data/eng/ita/index.txt`)
    - modify the existing learning progress store so that we do not practice already learned sentences again
2. after picking the two sentences, put all their parts into the pool of either to-be-introduced or to-be-practiced
    - keep the logic that makes sense intact (e.g. checking store if a gloss was seen before and thus should be practiced, not introduced, and so on)
    - notice that the legacy code has a lot of complexity, recursive parsing and fallbacks, while our data structure is now simpler and much of that isn't needed (and should be, unironically and actually, BE REMOVED)
        - there is no recursion, `parts` are not split into further parts
        - there are no paraphrased anythings
        - each `parts` entry has a translation (guaranteed) and may or may not have usageExamples, but if examples exist, they are *always* translated in the custom tuple structure that we established for that
3. when all parts of a given sentence are done, use the existing challenge task to let the user try and translate the sentence
4. when a sentence is "done" in this way, pick another unseen sentence and basically do `2.` again (adding the parts to the pool), so that the user is always working towards two sentences
    

Keep everything simple and MVP like.
READ!!!!!!! `developer-guidelines.md` and UNIRONICALLY stick to every line.
Do not make up features not discussed here (e.g. progress bars or other UI garbage)
If you are unsure and something is ACTUALLY NOT DISCUSSED and ACTUALLY UNCLEAR from the codebase, ask. 



```json

{
  "sentence": "A chi non piace quello?",
  "credits": [
    "Sentence from Tatoeba by Guybrush88 (CC-BY 2.0 FR)"
  ],
  "translations": [
    "Who doesn't like that?"
  ],
  "parts": [
    {
      "content": "A",
      "translations": [
        "Item: A",
        "Article: A",
        "Object: A"
      ],
      "usageExamples": [
        [
          "A quale proposito?",
          "For what purpose?"
        ],
        [
          "A volte, un po' di orgoglio è quello che ci serve.",
          "Sometimes, a little bit of pride is what we need."
        ],
        [
          "A proposito di musica classica, qual è il vostro compositore preferito?",
          "Talking of classical music, who is your favorite composer?"
        ]
      ]
    },
    {
      "content": "chi",
      "translations": [
        "who",
        "whom",
        "which",
        "that"
      ],
      "usageExamples": [
        [
          "Con chi ci andrà?",
          "Who are you going with?"
        ],
        [
          "Sai chi intendo.",
          "You know who I mean."
        ],
        [
          "Non sappiamo nemmeno con chi si è sposato Tom.",
          "We don't even know who Tom got married to."
        ]
      ]
    },
    {
      "content": "non",
      "translations": [
        "not",
        "no",
        "none",
        "never"
      ],
      "usageExamples": [
        [
          "Tom non cambia mai.",
          "Tom never changes."
        ],
        [
          "Perché non ha corso?",
          "Why didn't you run?"
        ],
        [
          "Certamente non lo odiava.",
          "She certainly did not hate him."
        ]
      ]
    },
    {
      "content": "piace",
      "translations": [
        "to like",
        "to please",
        "to be pleasing to"
      ],
      "usageExamples": [
        [
          "Mi piace il reggae.",
          "I like reggae."
        ],
        [
          "Che tipo di cibo non le piace?",
          "What kind of food don't you like?"
        ],
        [
          "A te piace il tuo appartamento nuovo?",
          "Do you like your new apartment?"
        ]
      ]
    },
    {
      "content": "quello",
      "translations": [
        "that",
        "the one",
        "those",
        "the"
      ],
      "usageExamples": [
        [
          "È quello che sono.",
          "It's what I am."
        ],
        [
          "È quello che fanno le persone intelligenti.",
          "That's what smart people do."
        ],
        [
          "È più freddo di quello che solitamente sperimentiamo.",
          "It's colder than what we usually experience."
        ]
      ]
    }
  ]
}

```