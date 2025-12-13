## Richtext Parser

## Introduction

The richtext parser included several parts:

- pltxt2htm: The core library that converts pltxt format to HTML. See more details at [pltxt2htm](https://github.com/SekaiArendelle/pltxt2htm)
- Latex renderer(Not implemented yet)
- Hightlight.js integration(Not implemented yet)

### Usage

Import parse function from commonparser(a inline parser, which does not include size, links .etc) or advanced parser.

Use attribute `v-richText="()=>parse(message.msg)"` in vue components.This well call async function to parse the text(No need to provide a default value) and rerender it when reactice/ref value updated.(See main.ts)

```Html
<div class="text">
    <p class="title" v-richText="()=>parse(data.Subject)"></p>
    <p class="subtitle">
        {{ data.User.Nickname + "&nbsp;&nbsp;-" + formattedDate }}
    </p>
</div>

...

import parse from "xxxxxxxxxx" //commonparser or advancedparser
```