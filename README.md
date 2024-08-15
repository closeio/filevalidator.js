# filevalidator.js
File signature validation in JavaScript

Useful for cases where looking at a filename extension only is not
reliable enough.

Usage:


```js
import { verifyFileType } from 'filevalidator';

const fileInput = document.getElementById('file-input');

fileInput.addEventListener('change', function(e) {
    const file = e.currentTarget.files[0];
    verifyFileType(file, ['mp3', 'wav'], function(valid) {
        alert('Valid mp3 or wave file: ' + !!valid);
    });
});
```

