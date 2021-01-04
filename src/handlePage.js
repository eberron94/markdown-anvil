const { flatten } = require('../util/flatten');

exports.handlePage = (markdown, json) => ({
    outputFolder,
    folderPrefix,
    content,
}) => {
    let lines = [];

    content.forEach((cc) => {
        switch (typeof cc) {
            case 'string':
            case 'number':
                lines.push('' + cc);
                break;
            case 'object':
                lines = lines.concat(
                    template(cc, folderPrefix, markdown, json)
                );
                break;
        }
    });

    return {
        outputFolder,
        content: lines,
    };
};

const template = (block, folderPrefix, markdown, json) => {
    if (typeof block !== 'object') {
        switch (typeof block) {
            case 'string':
            case 'number':
                return [block];
        }
        return [];
    }
    const { type, file, files, entries } = block;
    let lines = [];

    switch (type) {
        case 'md':
        case 'md-feat':
            console.log(`md-feat --- ${folderPrefix}/${file}`);
            const mdFile = markdown[`${folderPrefix}/${file}`];

            lines.push(getMarkdownFeat(mdFile));
            //TODO
            break;
        case 'md-group':
        case 'md-feat-group':
            const mdFileList = files.map(
                (f) => markdown[`${folderPrefix}/${f}`]
            );
            lines.push(mdFileList.map(getMarkdownFeat));
            break;
        case 'json-feat':
            //TODO
            break;
        case 'json-feat-group':
            //TODO
            break;
        case 'text':
        case 'p':
            lines = lines.concat(
                ['[p]'],
                Array.isArray(entries)
                    ? entries.map((e) =>
                          template(e, folderPrefix, markdown, json)
                      )
                    : [],
                ['[/p]']
            );
        case 'q':
            lines = lines.concat(
                ['[quote]'],
                Array.isArray(entries)
                    ? entries.map((e) =>
                          template(e, folderPrefix, markdown, json)
                      )
                    : [],
                ['[/quote]']
            );
    }

    return flatten(lines);
};

const getMetadataString = ({
    title,
    traits,
    rarity,
    access,
    prereq,
    req,
    action,
    archetype,
    level,
    label = 'Feat',
}) => {
    const lines = [];

    //Build title
    let featTitle = `[section:feat]${title}`;

    switch (action) {
        case 'one-action':
            featTitle += '[section:one-action][/section]';
            break;
        case 'two-action':
            featTitle += '[section:one-action][/section]';
            break;
        case 'three-action':
            featTitle += '[section:one-action][/section]';
            break;
        case 'reaction':
            featTitle += '[section:one-action][/section]';
            break;
        case 'free-action':
            featTitle += '[section:one-action][/section]';
            break;
    }

    if (level) {
        featTitle += `[right]${label} ${level}[/right]`;
    }

    featTitle += `[/section]`;

    switch (rarity) {
        case 'uncommon':
            featTitle += '[section:trait-uncommon]uncommon[/section]';
            break;
        case 'rare':
            featTitle += '[section:trait-rare]rare[/section]';
            break;
        case 'unique':
            featTitle += '[section:trait-unique]unique[/section]';
            break;
    }

    lines.push(featTitle);

    //Build traits

    if (Array.isArray(traits) && traits.length) {
        lines.push(
            traits.map((trait) => `[section:trait]${trait}[/section]`).join('')
        );
    }

    //Build remaining strings

    if (archetype || access || prereq || req) {
        lines.push('[p]');
        if (typeof archetype === 'string') {
            lines.push(`[b]Archetype[/b] ${archetype}`);
        }

        if (typeof access === 'string') {
            lines.push(`[b]Access[/b] ${access}`);
        }

        if (typeof prereq === 'string') {
            lines.push(`[b]Prerequisites[/b] ${prereq}`);
        }

        if (typeof req === 'string') {
            lines.push(`[b]Requirement[/b] ${req}`);
        }
    }

    return lines;
};

const getMarkdownFeat = ({ metadata, content }) => {
    return [
        getMetadataString(metadata),
        markdownToWorldAnvil(content).trim().replace(/\r\n/g, '\n\n'),
        '[/p]',
    ];
};

const markdownToWorldAnvil = (starStr) => {
    let str = starStr
    str = str.replace(
        /\*\*\*([^\*]+)\*\*\*/g,
        '[b][i]$1[/i][/b]'
    );

    str = str.replace(/\*\*([^\*]+)\*\*/g, '[b]$1[/b]');

    str = str.replace(/\*([^\*]+)\*/g, '[i]$1[/i]');

    return str;
};
