export const LoadClickwrapApi = callback => {
  const existingScript = document.getElementById("clickwrapscript");

  if (!existingScript) {
    const script = document.createElement("script");
    script.src = process.env.REACT_APP_DS_CLICKWRAP_URL;
    script.id = "clickwrapscript";
    document.body.prepend(script);

    script.onload = () => {
      if (callback) callback();
    };
  }

  if (existingScript && callback) callback();
};
