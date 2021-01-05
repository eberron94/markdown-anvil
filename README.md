# Markdown Anvil

I love World Anvil and its mission. But, they have made some design decisions with their markup language that I do not like that were made for the sake of security. And since they lack an API that allows one to use an external editor and then upload my files, I had to create a solution to let me write my articles the way I want.

To do so, I create a light script that parses a json object that describes the content of a given article and compiles several linked markdown and json files. This lets me write chunks of an article in smaller files, which are much easier to read and maintain. Then I run the script and I get one to three `.txt` files per page that I can copy and paste into the correct content blocks.

## Why did you make this?
I created this for Pathfinder 2e and writing Archetypes. To make my content easy to use for a player or GM, I need all the feats on a single page. They need a consistent style and any deviation from that style looks bad. Since feats have a similar data structure, it made sense to me to store them as json and markdown files and then have a script that handled the formatting. After a short afternoon, I had this prototype.

## How do I use it?
As I expand the script, I will add additional formatting options, but for now this tutorial will walk you through creating a page with several feats.

The first we do is create the `lycanthrope.json` file in the `/pages` folder. This json object will tell the script how we want the feats to be displayed. 

`outputFolder` is a string that is the name of the folder in `/output` you want the resulting `content.txt` `footContent.txt`, and `sideContent.txt` to appear in. In general, name this something similar to your article title so you do not confuse articles.

`folderPrefix` is a string that is the name of the folder in `/content` you want to store you `.md`, `.mdx`, and `.json` files. You should name this folder like `outputFolder`, but you do not need to.

`content` is an array of objects or strings that describes the layout and text of the resulting `context.txt`.

`footContent` is like `content`, but for `footContent.txt`.

`sideContent` is like `content`, but for `sideContent.txt`.

Like I mentioned above, the content arrays can have strings or objects. Each object must follow one of the defined types or it is ignored. For now, see the types in the `lycanthrope.json` file.

Once you have the pages files done, run the script by typing in `npm run`. You will see the output folder has the resulting files.