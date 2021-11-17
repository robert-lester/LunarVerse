export default (id): string => `
    <style type="text/css">
      #shuttle__${id} * {
        box-sizing: border-box;
      }

      #shuttle__${id} blockquote,
      #shuttle__${id} button,
      #shuttle__${id} h1,
      #shuttle__${id} h2,
      #shuttle__${id} h3,
      #shuttle__${id} h4,
      #shuttle__${id} h5,
      #shuttle__${id} h6,
      #shuttle__${id} ol,
      #shuttle__${id} p,
      #shuttle__${id} ul {
        margin: 0;
        padding: 0;
      }

      #shuttle__${id} ol,
      #shuttle__${id} ul {
        list-style: none;
      }

      #shuttle__${id} a {
        text-decoration: none;
      }

      #shuttle__${id} button,
      #shuttle__${id} select {
        border: none;
        outline: none;
        background: none;
      }

      #shuttle__${id} a,
      #shuttle__${id} button,
      #shuttle__${id} input,
      #shuttle__${id} select,
      #shuttle__${id} textarea {
        -webkit-tap-highlight-color: transparent;
      }

      #shuttle__${id} .hidden__${id},
      #shuttle__${id} .hidden__${id} ~ * {
        display: none !important;
      }

      .container-lg__${id} {
        margin: 0 auto;
        padding: 0 20px;
        width: 100%;
      }

      .container-lg__${id} {
        max-width: 1040px;
      }

      /** Page-specific styles */

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }

        to {
          transform: rotate(1turn);
        }
      }

      @keyframes void-animation-out {
        0%,
        to {
          opacity: 1;
        }
      }

      #shuttle__${id} {
        position: relative;
        display: block;
        z-index: 1;
      }

      #shuttle__${id}>.container-lg__${id} {
        display: -ms-flexbox;
        display: flex;
        -ms-flex-wrap: wrap;
        flex-wrap: wrap;
        position: relative;
        max-width: 750px;
        padding: 50px 20px;
      }

      @media all and (min-width: 50em) {
        #shuttle__${id}>.container-lg__${id} {
          padding: 110px 20px 110px;
        }
      }

      #shuttle__${id}>.container-lg__${id} .cell__${id} {
        display: -ms-flexbox;
        display: flex;
        -ms-flex-direction: column;
        flex-direction: column;
        -ms-flex-pack: center;
        justify-content: center;
        position: relative;
        -ms-flex: auto;
        flex: auto;
        min-width: 100%;
        min-height: 500px;
        padding: 0 40px;
      }

      #shuttle__${id}>.container-lg__${id} .shuttle__${id} {
        -ms-flex-align: center;
        align-items: center;
        border-radius: 4px;
        box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
        padding: 80px 10px;
        margin-left: -10px;
        margin-right: -10px;
        font-family: FONT_FAMILY;
      }

      @media (min-width: 670px) {
        #shuttle__${id}>.container-lg__${id} .shuttle__${id} {
          padding: 40px;
        }
      }

      #shuttle__${id}>.container-lg__${id} .shuttle__${id}.submitted__${id} form,
      #shuttle__${id}>.container-lg__${id} .shuttle__${id}.submitting__${id} form {
        opacity: 0;
        transform: scale(0.9);
        pointer-events: none;
      }

      #shuttle__${id}>.container-lg__${id} .shuttle__${id}.submitted__${id} .success__${id},
      #shuttle__${id}>.container-lg__${id} .shuttle__${id}.submitting__${id} .success__${id} {
        pointer-events: all;
      }

      #shuttle__${id}>.container-lg__${id} .shuttle__${id}.submitting__${id} .success__${id} .icon__${id} {
        opacity: 1;
      }

      #shuttle__${id}>.container-lg__${id} .shuttle__${id}.submitted__${id} .success__${id}>* {
        opacity: 1;
        transform: none !important;
      }

      #shuttle__${id}>.container-lg__${id} .shuttle__${id}.submitted__${id} .success__${id}> :nth-child(2) {
        transition-delay: 0.1s;
      }

      #shuttle__${id}>.container-lg__${id} .shuttle__${id}.submitted__${id} .success__${id}> :nth-child(3) {
        transition-delay: 0.2s;
      }

      #shuttle__${id}>.container-lg__${id} .shuttle__${id}.submitted__${id} .success__${id}> :nth-child(4) {
        transition-delay: 0.3s;
      }

      #shuttle__${id}>.container-lg__${id} .shuttle__${id}.submitted__${id} .success__${id} .icon__${id} .border__${id},
      #shuttle__${id}>.container-lg__${id} .shuttle__${id}.submitted__${id} .success__${id} .icon__${id} .checkmark__${id} {
        opacity: 1;
        stroke-dashoffset: 0 !important;
      }

      #shuttle__${id}>.container-lg__${id} .shuttle__${id} form {
        position: relative;
        width: 100%;
        max-width: 500px;
        transition-property: opacity, transform;
        transition-duration: 0.35s;
        transition-timing-function: cubic-bezier(0.165, 0.84, 0.44, 1);
      }

      #shuttle__${id}>.container-lg__${id} .shuttle__${id} form input::-webkit-input-placeholder {
        opacity: 1;
      }

      #shuttle__${id}>.container-lg__${id} .shuttle__${id} form input::-moz-placeholder {
        opacity: 1;
      }

      #shuttle__${id}>.container-lg__${id} .shuttle__${id} form input:-ms-input-placeholder {
        opacity: 1;
      }

      #shuttle__${id}>.container-lg__${id} .shuttle__${id} .error__${id} {
        display: -ms-flexbox;
        display: flex;
        -ms-flex-pack: center;
        justify-content: center;
        position: absolute;
        width: 100%;
        top: 100%;
        margin-top: 10px;
        left: 0;
        padding: 0 15px;
        font-size: 13px !important;
        opacity: 0;
        transform: translateY(10px);
        transition-property: opacity, transform;
        transition-duration: 0.35s;
        transition-timing-function: cubic-bezier(0.165, 0.84, 0.44, 1);
      }

      #shuttle__${id}>.container-lg__${id} .shuttle__${id} .error__${id}.visible__${id} {
        opacity: 1;
        transform: none;
      }

      #shuttle__${id}>.container-lg__${id} .shuttle__${id} .error__${id} .message__${id} {
        font-size: inherit;
      }

      #shuttle__${id}>.container-lg__${id} .shuttle__${id} .error__${id} svg {
        -ms-flex-negative: 0;
        flex-shrink: 0;
        margin-top: -1px;
        margin-right: 10px;
      }

      #shuttle__${id}>.container-lg__${id} .shuttle__${id} .success__${id} {
        display: -ms-flexbox;
        display: flex;
        -ms-flex-direction: column;
        flex-direction: column;
        -ms-flex-align: center;
        align-items: center;
        -ms-flex-pack: center;
        justify-content: center;
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        padding: 10px;
        text-align: center;
        pointer-events: none;
        overflow: hidden;
      }

      @media (min-width: 670px) {
        #shuttle__${id}>.container-lg__${id} .shuttle__${id} .success__${id} {
          padding: 40px;
        }
      }

      #shuttle__${id}>.container-lg__${id} .shuttle__${id} .success__${id}>* {
        transition-property: opacity, transform;
        transition-duration: 0.35s;
        transition-timing-function: cubic-bezier(0.165, 0.84, 0.44, 1);
        opacity: 0;
        transform: translateY(50px);
      }

      #shuttle__${id}>.container-lg__${id} .shuttle__${id} .success__${id} .icon__${id} {
        margin: 15px 0 30px;
        transform: translateY(70px) scale(0.75);
      }

      #shuttle__${id}>.container-lg__${id} .shuttle__${id} .success__${id} .icon__${id} svg {
        will-change: transform;
      }

      #shuttle__${id}>.container-lg__${id} .shuttle__${id} .success__${id} .icon__${id} .border__${id} {
        stroke-dasharray: 251;
        stroke-dashoffset: 62.75;
        transform-origin: 50% 50%;
        transition: stroke-dashoffset 0.35s cubic-bezier(0.165, 0.84, 0.44, 1);
        animation: spin 1s linear infinite;
      }

      #shuttle__${id}>.container-lg__${id} .shuttle__${id} .success__${id} .icon__${id} .checkmark__${id} {
        stroke-dasharray: 60;
        stroke-dashoffset: 60;
        transition: stroke-dashoffset 0.35s cubic-bezier(0.165, 0.84, 0.44, 1) 0.35s;
      }

      #shuttle__${id}>.container-lg__${id} .shuttle__${id} .success__${id} .title__${id} {
        font-size: calc(FONT_SIZE - 2px);
        font-weight: 500;
        margin-bottom: 8px;
      }

      #shuttle__${id}>.container-lg__${id} .shuttle__${id} .success__${id} .message__${id} {
        font-size: calc(FONT_SIZE - 4px);
        font-weight: 400;
        margin-bottom: 25px;
        line-height: 1.6em;
      }

      @media all and (min-width: 50em) {
        #shuttle__${id}>.container-lg__${id} .shuttle__${id} .success__${id} .title__${id} {
          font-size: calc(FONT_SIZE + 1px);
        }
        #shuttle__${id}>.container-lg__${id} .shuttle__${id} .success__${id} .message__${id} {
          font-size: calc(FONT_SIZE - 2px);
        }
      }

      #shuttle__${id}>.container-lg__${id} .shuttle__${id} .success__${id} .message__${id} span {
        font-size: inherit;
      }

      .shuttle__${id}.form__${id} {
        background-color: BACKGROUND_COLOR;
      }

      .shuttle__${id}.form__${id} * {
        font-size: calc(FONT_SIZE - 2px);
        font-weight: 500;
      }
      @media all and (min-width: 50em) {
        .shuttle__${id}.form__${id} * {
          font-size: FONT_SIZE;
        }
      }

      .shuttle__${id}.form__${id} .row__${id} {
        display: -ms-flexbox;
        display: flex;
        margin: 0 5px 10px;
      }

      .shuttle__${id}.form__${id} .field__${id} {
        position: relative;
        width: 100%;
        min-height: 50px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0;
      }

      .check_radio__${id} {
        flex-direction: column;
        align-items: center;
      }

      .check_radio__${id} > .field__${id} {
        padding: 0 !important
      }

      @media all and (min-width: 50em) {
        input[type="checkbox"] {
          width: 40px;
        }
      }

      .shuttle__${id}.form__${id} .field__${id}.hide {
        display: none;
      }

      .shuttle__${id}.form__${id} .field__${id}.column__${id} {
        flex-direction: column;
        align-items: flex-start;
      }

      .shuttle__${id}.form__${id} .field__${id}.column__${id} p {
        color: FONT_COLOR;
        margin-bottom: 15px;
      }

      .shuttle__${id}.form__${id} .field__${id}.half-width__${id} {
        width: 50%;
      }

      .shuttle__${id}.form__${id} .field__${id}.third-width__${id} {
        width: calc(33% - 10px);
      }

      .shuttle__${id}.form__${id} .field__${id}.quarter-width__${id} {
        width: calc(25% - 10px);
      }

      .shuttle__${id}.form__${id} .baseline__${id} {
        position: absolute;
        width: 90%;
        height: 1px;
        left: 0;
        bottom: 0;
        background-color: #cfd7df;
        transition: background-color 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
      }

      .shuttle__${id}.form__${id} label.not-text__${id} {
        position: initial;
        padding-left: 1em;
        color: FONT_COLOR;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        transform-origin: 0 50%;
        cursor: text;
        transition-property: color, transform;
        transition-duration: 0.3s;
        transition-timing-function: cubic-bezier(0.165, 0.84, 0.44, 1);
      }

      .shuttle__${id}.form__${id} label {
        position: absolute;
        width: 100%;
        left: 0;
        bottom: 8px;
        color: FONT_COLOR;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        transform-origin: 0 50%;
        cursor: text;
        transition-property: color, transform;
        transition-duration: 0.3s;
        transition-timing-function: cubic-bezier(0.165, 0.84, 0.44, 1);
      }

      .shuttle__${id}.form__${id} .input__${id} {
        position: absolute;
        width: 100%;
        left: 0;
        bottom: 0;
        padding-bottom: 7px;
        color: FONT_COLOR;
        background-color: transparent;
      }

      .shuttle__${id}.form__${id} .select_wrapper__${id} {
        background-color: BUTTON_COLOR;
        display: inline-block;
        position: relative;
        border-radius: 3px;
      }

      .shuttle__${id}.form__${id} .select_wrapper__${id}::after {
        position: absolute;
        pointer-events: none;
        content: "\\25BE";
        color: FONT_COLOR;
        font-size: .625em;
        line-height: 1;
        right: 0.7em;
        top: 25%;
      }

      .shuttle__${id}.form__${id} select {
        position: relative;
        width: 75%;
        background-color: transparent;
        color: FONT_COLOR;
        font-size: inherit;
        padding: 0.5em;
        min-width: 150px;
        border: 0;
        margin: 0;
        text-overflow: ellipsis;
        cursor: pointer;
        -webkit-appearance: none;
        -ms-appearance: none;
        -moz-appearance: none;
        appearance: none;
      }

      .shuttle-form input[type='text'],
      .shuttle-form input[type='tel'],
      .shuttle-form input[type='email'] {
        margin: 0;
        box-shadow: none;
      }

      .shuttle-form input[type='text']:focus,
      .shuttle-form input[type='tel']:focus,
      .shuttle-form input[type='email']:focus {
        box-shadow: none;
      }

      .shuttle__${id}.form__${id} .input__${id}::-webkit-input-placeholder {
        color: transparent;
        transition: color 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
      }

      .shuttle__${id}.form__${id} .input__${id}::-moz-placeholder {
        color: transparent;
        transition: color 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
      }

      .shuttle__${id}.form__${id} .input__${id}:-ms-input-placeholder {
        color: transparent;
        transition: color 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
      }

      .shuttle__${id}.form__${id} .input__${id}.focused__${id},
      .shuttle__${id}.form__${id} .input__${id}:not(.empty__${id}) {
        opacity: 1;
      }

      .shuttle__${id}.form__${id} .input__${id}.focused__${id}::-webkit-input-placeholder,
      .shuttle__${id}.form__${id} .input__${id}:not(.empty__${id})::-webkit-input-placeholder {
        color: #cfd7df;
      }

      .shuttle__${id}.form__${id} .input__${id}.focused__${id}::-moz-placeholder,
      .shuttle__${id}.form__${id} .input__${id}:not(.empty__${id})::-moz-placeholder {
        color: #cfd7df;
      }

      .shuttle__${id}.form__${id} .input__${id}.focused__${id}:-ms-input-placeholder,
      .shuttle__${id}.form__${id} .input__${id}:not(.empty__${id}):-ms-input-placeholder {
        color: #cfd7df;
      }

      .shuttle__${id}.form__${id} .input__${id}.focused__${id}+label,
      .shuttle__${id}.form__${id} .input__${id}:not(.empty__${id})+label {
        color: #aab7c4;
        transform: scale(0.85) translateY(-25px);
        cursor: default;
      }

      .shuttle__${id}.form__${id} .input__${id}.focused__${id}+label {
        color: BUTTON_COLOR;
      }

      .shuttle__${id}.form__${id} .input__${id}.invalid__${id}+label {
        color: #e25950;
      }

      .shuttle__${id}.form__${id} .input__${id}.focused__${id}+label+.baseline__${id} {
        background-color: BUTTON_COLOR;
      }

      .shuttle__${id}.form__${id} input[type='checkbox'].invalid__${id} {
        box-shadow: 0px 0px 0px 1px rgba(255,0,0,1);
      }

      .shuttle__${id}.form__${id} .input__${id}.focused__${id}.invalid__${id}+label+.baseline__${id} {
        background-color: #e25950;
      }

      .shuttle__${id}.form__${id} input[type='text'],
      .shuttle__${id}.form__${id} input[type='email'],
      .shuttle__${id}.form__${id} input[type='tel'],
      .shuttle__${id}.form__${id} button {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        outline: none;
        border-style: none;
      }

      .shuttle__${id}.form__${id} input:-webkit-autofill {
        -webkit-text-fill-color: #e39f48;
        transition: background-color 100000000s;
        -webkit-animation: 1ms void-animation-out;
      }

      .shuttle__${id}.form__${id} input,
      .shuttle__${id}.form__${id} button {
        -webkit-animation: 1ms void-animation-out;
      }

      #shuttle__${id} .shuttle__${id}.form__${id} button {
        display: block;
        width: calc(100% - 30px);
        height: 40px;
        margin: 40px 15px 0;
        background-color: BUTTON_COLOR;
        border-radius: 4px;
        color: #fff;
        text-transform: uppercase;
        font-weight: 600;
        cursor: pointer;
      }

      .shuttle__${id}.form__${id} .error__${id} svg {
        margin-top: 0 !important;
      }

      .shuttle__${id}.form__${id} .error__${id} svg .base__${id} {
        fill: #e25950;
      }

      .shuttle__${id}.form__${id} .error__${id} svg .glyph__${id} {
        fill: #fff;
      }

      .shuttle__${id}.form__${id} .error__${id} .message__${id} {
        color: #e25950;
      }

      .shuttle__${id}.form__${id} .success__${id} .icon__${id} .border__${id} {
        stroke: #abe9d2;
      }

      .shuttle__${id}.form__${id} .success__${id} .icon__${id} .checkmark__${id} {
        stroke: BUTTON_COLOR;
      }

      .shuttle__${id}.form__${id} .success__${id} .title__${id} {
        color: FONT_COLOR;
        font-size: FONT_SIZE !important;
      }

      .shuttle__${id}.form__${id} .success__${id} .message__${id} {
        color: #8898aa;
        font-size: calc(FONT_SIZE - 3px) !important;
      }
    </style>`;
