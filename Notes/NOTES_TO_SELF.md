## Simple smoke-test cases

- http://localhost:3000/
- http://localhost:3000/?name=
- http://localhost:3000/?name=Always%20On
- http://localhost:3000/?exclude=&name=Always%20On
- http://localhost:3000/?exclude=food&name=Always%20On
- http://localhost:3000/?includeTop=true&exclude=food&exclude=twitchpresents2&name=Always%20On
- http://localhost:3000/?name=Always%20On&include=
- http://localhost:3000/?name=Always%20On&include=
- http://localhost:3000/?name=Stardew%20Valley&include=food
- http://localhost:3000/?name=Stardew%20Valley&include=food&exclude=day9tv
- http://localhost:3000/?name=Stardew%20Valley&include=food&exclude=day9tv&exclude=day9tv
- http://localhost:3000/?language=en&name=Always%20On
- http://localhost:3000/?language=en&name=Always%20On&include=epilinet - That's a Chinese stream, shouldn't show for English-only
