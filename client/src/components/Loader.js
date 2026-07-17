export const Loader = ({ visible, title, paragraph }) => {
  return (
    visible && (
      <div className="LoaderWrapper">
        <span className="Loader"></span>
        {title ?
          <div>
            <h2 className="LoaderHeader">{title}</h2>
            <div className="LoaderText">{paragraph}</div>
          </div>
          : null
        }
      </div>
    )
  );
};
