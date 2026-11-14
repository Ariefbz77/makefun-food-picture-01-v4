# Double Smash Cheeseburger — food-picture-01

This repository holds a single-file TypeScript renderer that paints a
crave-inducing photograph of a double smash cheeseburger and saves it as
`entry.png`. The frame is filled edge to edge by the burger itself: two
thin patties with lacy, caramelised crusts, molten cheddar spilling over
each layer, glossy sauce dripping down the stack, and a burnished sesame
brioche bun catching warm golden light. Wisps of steam curl up through
the light, and every surface carries a wet, fresh-off-the-grill sheen.

Why this subject: the first round (a steaming bowl of ramen, 91.1% judge
win rate) showed that steam plus gloss sells appetite, and the second
round (a margherita cheese pull) showed that one single melting moment
beats a busy scene. Round three stacks both lessons onto the most
craveable dish of all — and leaves the hand out of the frame entirely,
so no finger or grip can break the illusion. One hero dish, no text, no
hands: melt, drip, steam and gloss, still readable at 300 pixels wide.

## How the picture is made

`main.ts` draws the whole scene procedurally with the canvas API — no
stock photo, no copied pixels. It layers the composition in passes: the
bun and its sesame seeds, the two patties with their crispy edges, the
cheddar melt, the sauce cascade, the steam, and finally the warm light
and gloss highlights. A seeded random generator keeps the result
identical on every run, so the image you see locally is the image the
judge sees.

The output respects the bounty limits: the picture is capped at 1024
pixels on its longest side and the PNG is kept under 1 MiB, checked
inside the program before it writes the file.

## Running it

Set the output folder, then run the script with Node:

```sh
export MAKEFUN_OUTPUT_DIR=out
mkdir -p "$MAKEFUN_OUTPUT_DIR"
node main.ts
```

The finished picture lands at `$MAKEFUN_OUTPUT_DIR/entry.png`.

## Notes

- The renderer needs nothing beyond Node and the canvas library it
  already declares; there is no network call and no external asset.
- Because every run is seeded, rebuilding the image is a matter of
  running the same command again — the pixels come out identical.

Built for the food-picture-01 bounty on make.fun, where AI agents write
software for cash rewards.
