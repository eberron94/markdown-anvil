const { flatten } = require('../util/flatten');

exports.handlePage = (markdown, json) => ({
    outputFolder,
    folderPrefix,
    content: bodyContent = [],
    footContent = [],
    sideContent = [],
}) => {
    const commonWork = cc => {
        switch (typeof cc) {
            case 'string':
            case 'number':
                return '' + cc;
            case 'object':
                return template(cc, folderPrefix, markdown, json);
        }
    };

    const bodyLines = bodyContent.map(cc => commonWork(cc));
    const footLines = footContent.map(cc => commonWork(cc));
    const sideLines = sideContent.map(cc => commonWork(cc));

    return {
        outputFolder,
        content: flatten(bodyLines),
        footContent: flatten(footLines),
        sideContent: flatten(sideLines),
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
            const mdFile = markdown[`${folderPrefix}/${file}`];
            lines.push(getMarkdownGeneric(mdFile));
            break;
        case 'md-feat':
            const mdFeatFile = markdown[`${folderPrefix}/${file}`];
            lines.push(getMarkdownFeat(mdFeatFile));
            break;
        case 'md-group':
        case 'md-feat-group':
            const mdFeatFileList = files
                .map(f => markdown[`${folderPrefix}/${f}`])
                .sort(sortFeat);
            lines.push(mdFeatFileList.map(getMarkdownFeat));
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
                    ? entries.map(e =>
                          template(e, folderPrefix, markdown, json)
                      )
                    : [],
                ['[/p]']
            );
            break;
        case 'q':
        case 'quote':
            lines = lines.concat(
                ['[quote]'],
                Array.isArray(entries)
                    ? entries.map(e =>
                          template(e, folderPrefix, markdown, json)
                      )
                    : [],
                ['[/quote]']
            );
            break;
    }

    return flatten(lines);
};

const sortFeat = ({ metadata: a }, { metadata: b }) => {
    if (typeof a.level === 'number' && typeof b.level === 'number') {
        if (a.level < b.level) return -1;
        if (a.level > b.level) return 1;
    }
    if (a.title < b.title) return -1;
    if (a.title > b.title) return 1;
    return 0;
};

const getMetadataFeatTitle = ({
    title,
    traits,
    rarity,
    action,
    level,
    label = 'Feat',
}) => {
    const lines = [];

    //Build title
    let featTitle = `[section:feat]${title}`;

    switch (action) {
        case 'one-action':
            featTitle += ' [section:one-action][/section]';
            break;
        case 'two-action':
            featTitle += ' [section:two-action][/section]';
            break;
        case 'three-action':
            featTitle += ' [section:three-action][/section]';
            break;
        case 'reaction':
            featTitle += ' [section:reaction][/section]';
            break;
        case 'free-action':
            featTitle += ' [section:free-action][/section]';
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
            traits.map(trait => `[section:trait]${trait}[/section]`).join('')
        );
    }

    return lines.join('');
};

const getMetadataHeaderTitle = ({ title, heading }) => {
    let headingLevel = Number(heading.replace(/[^0-9]/g, ''));

    if (!Number.isFinite(headingLevel) && headingLevel < 1) {
        headingLevel = 1;
    }

    return [`[h${headingLevel}]${title}[/h${headingLevel}]`];
};

const getMetadataContent = ({ access, prereq, req, archetype }) => {
    const lines = [];

    //Build remaining strings

    if (archetype && typeof archetype === 'string') {
        lines.push(`[b]Archetype[/b] ${archetype}`);
    }

    if (access && typeof access === 'string') {
        lines.push(`[b]Access[/b] ${access}`);
    }

    if (prereq && typeof prereq === 'string') {
        lines.push(`[b]Prerequisites[/b] ${prereq}`);
    }

    if (req && typeof req === 'string') {
        lines.push(`[b]Requirement[/b] ${req}`);
    }

    return lines;
};

const getMarkdownGeneric = ({ metadata, content }) => {
    return [
        getMetadataHeaderTitle(metadata),
        '[p]',
        getMetadataContent(metadata),
        markdownToWorldAnvil(content).trim(),
        '[/p]',
    ];
};

const getMarkdownFeat = ({ metadata, content }) => {
    return [
        getMetadataFeatTitle(metadata),
        '[p]',
        getMetadataContent(metadata),
        markdownToWorldAnvil(content).trim(),
        '[/p]',
    ];
};

const markdownToWorldAnvil = starStr => {
    let str = starStr.trim();
    str = str.replace(/\*\*\*([^\*]+)\*\*\*/g, '[b][i]$1[/i][/b]');

    str = str.replace(/\*\*([^\*]+)\*\*/g, '[b]$1[/b]');

    str = str.replace(/\*([^\*]+)\*/g, '[i]$1[/i]');

    str = str.replace(/\r+\n+/g, '\n');
    str = str.replace(/\xa0+/g, ' ');

    str.split('\n')
        .map(e => e.trim())
        .filter(e => e)
        .join('\n\n');

    return str;
};
