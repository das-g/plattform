```react
state: {
    value: [
        {
           type: 'paragraph',
           children: [{ text: '' }]
        }
    ],
    structure: [
        {
            type: ['paragraph', 'headline', 'ul', 'ol', 'blockQuote', 'blockCode'],
            repeat: true
        }
    ]
}
---
<Editor
    value={state.value}
    setValue={(newValue) => {
        setState({value: newValue})
    }}
    structure={state.structure}
    config={{ maxSigns: 3000, debug: true, schema: schemaComment, toolbar: 'fixed' }}
/>
```

## Rendering

#### Web

```react
<SlateRender value={tree1} schema={schemaComment} />
```

#### Email

```react
<SlateRender value={tree1} schema={schemaCommentEmail} />
```

### Plain Text

```react
<div>
    {renderAsText(tree1)}
</div>
```