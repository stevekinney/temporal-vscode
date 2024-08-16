type WebviewContent = {
  title?: string;
  styles?: string;
};

/**
 * Renders HTML as a string.
 */
export const html = (
  strings: TemplateStringsArray,
  ...values: unknown[]
): string => {
  return strings.reduce((result, string, i) => {
    const value = values[i] !== undefined ? values[i] : '';
    return result + string + value;
  }, '');
};

/**
 * Renders CSS as a string.
 */
export const css = (
  strings: TemplateStringsArray,
  ...values: unknown[]
): string => {
  return strings.reduce((result, string, i) => {
    const value = values[i] !== undefined ? values[i] : '';
    return result + string + value;
  }, '');
};

export const render = (
  content: string,
  { title = 'Temporal', styles = '' }: WebviewContent = {},
) => {
  return html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
        <style>
          ${styles}
        </style>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `;
};

export const each = <T>(
  data: Record<string, T> | T[],
  callback: (keyOrValue: string | T, value?: T) => string,
): string => {
  if (Array.isArray(data)) {
    // Handle array: pass only the value to the callback
    return data.reduce((result, value) => {
      return result + callback(value);
    }, '');
  } else {
    // Handle object: pass both key and value to the callback
    return Object.entries(data).reduce((result, [key, value]) => {
      return result + callback(key, value);
    }, '');
  }
};
