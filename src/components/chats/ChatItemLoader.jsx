function ChatItemLoader() {
  return (
    <div className="chat_card skeleton">
      <div className="img skeleton-img"></div>
      <div className="content">
        <h6 className="skeleton-text skeleton-title"></h6>
        <p className="skeleton-text"></p>
        <span className="skeleton-text"></span>
      </div>
    </div>
  );
}

export default ChatItemLoader;
