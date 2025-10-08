"use client";

function PersonLoader() {
  return (
    <div className="PersonCard skeleton">
      <div className="img_info">
        <div className="img skeleton-img"></div>
        <div className="info">
          <h4 className="skeleton-text skeleton-title"></h4>
          <p className="skeleton-text"></p>
        </div>
      </div>
    </div>
  );
}

export default PersonLoader;
