// // "use client";
// // import { Link } from "@/i18n/navigation";
// // import { useAuthStore } from "@/stores/useAuthStore";
// // import Image from "next/image";
// // import { useTranslations } from "use-intl";
// // import StarsRate from "../shared/StarsRate";

// // export default function CommentCard({
// //   comment,
// //   setTargetComment,
// //   className,
// //   type,
// // }) {
// //   const t = useTranslations();
// //   const { user } = useAuthStore((state) => state);
// //   return (
// //     <div className="CommentWrapper">
// //       <div className="CommentCard">
// //         {" "}
// //         <Link
// //           aria-label="Profile"
// //           to={`${
// //             +comment?.user_id === +user?.id
// //               ? "/profile"
// //               : `/profile/${comment?.user_id}`
// //           }`}
// //           className="img"
// //         >
// //           <Image
// //             width={36}
// //             height={36}
// //             src={comment?.user_image}
// //             alt={comment?.user_name}
// //             // onError={(e) => (e.target.src = "/icons/user_default.png")}
// //           />
// //         </Link>{" "}
// //         <div className="content">
// //           <div className="d-flex align-items-center justify-content-between mb-2">
// //             <h6 className="mb-0">{comment?.user_name}</h6>
// //             {comment?.rate && <StarsRate rate={comment?.rate} />}
// //           </div>
// //           <div className="comment">
// //             <p>{comment?.comment}</p>
// //           </div>
// //           <div className="actions">
// //             <span>{comment?.date}</span>

// //             <button
// //               aria-label="Reply"
// //               onClick={() => setTargetComment(comment)}
// //             >
// //               {t("reply")}
// //             </button>

// //             {comment?.user_id === user?.id && (
// //               <button
// //                 aria-label="Delete"
// //                 // onClick={() => {
// //                 //   deleteComment();
// //                 // }}
// //               >
// //                 {t("delete")}
// //               </button>
// //             )}
// //           </div>
// //         </div>
// //       </div>

// //       {comment?.replies?.length > 0 && (
// //         <div className={`replies ${className}`}>
// //           {comment.replies.map((reply) => (
// //             <CommentCard
// //               key={reply.id}
// //               comment={reply}
// //               // deleteComment={deleteComment}
// //               setTargetComment={setTargetComment}
// //               type={type}
// //             />
// //           ))}
// //         </div>
// //       )}
// //     </div>
// //   );
// // }
// "use client";

// import { Link } from "@/i18n/navigation";
// import { useAuthStore } from "@/stores/useAuthStore";
// import Image from "next/image";
// import { useTranslations } from "use-intl";
// import StarsRate from "../shared/StarsRate";

// export default function CommentCard({
//   comment,
//   setTargetComment,
//   className,
//   type,
//   onDeleteComment,
//   parentId = null,
// }) {
//   const t = useTranslations();
//   const { user } = useAuthStore((state) => state);

//   return (
//     <div className="CommentWrapper">
//       <div className="CommentCard">
//         <Link
//           aria-label="Profile"
//           to={
//             +comment?.user_id === +user?.id
//               ? "/profile"
//               : `/profile/${comment?.user_id}`
//           }
//           className="img"
//         >
//           <Image
//             width={36}
//             height={36}
//             src={comment?.user_image}
//             alt={comment?.user_name}
//           />
//         </Link>

//         <div className="content">
//           <div className="d-flex align-items-center justify-content-between mb-2">
//             <h6 className="mb-0">{comment?.user_name}</h6>
//             {comment?.rate && <StarsRate rate={comment?.rate} />}
//           </div>

//           <div className="comment">
//             <p>{comment?.comment}</p>
//           </div>

//           <div className="actions">
//             <span>{comment?.date}</span>

//             <button
//               aria-label="Reply"
//               onClick={() => setTargetComment(comment)}
//             >
//               {t("reply")}
//             </button>

//             {comment?.user_id === user?.id && (
//               <button
//                 aria-label="Delete"
//                 onClick={() => onDeleteComment?.(comment.id, parentId, type)}
//               >
//                 {t("delete")}
//               </button>
//             )}
//           </div>
//         </div>
//       </div>

//       {comment?.replies?.length > 0 && (
//         <div className={`replies ${className}`}>
//           {comment.replies.map((reply) => (
//             <CommentCard
//               key={reply.id}
//               comment={reply}
//               className={className}
//               setTargetComment={setTargetComment}
//               type={type}
//               onDeleteComment={onDeleteComment}
//               parentId={comment.id}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
"use client";

import { Link } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import Image from "next/image";
import { useTranslations } from "use-intl";
import StarsRate from "../shared/StarsRate";

export default function CommentCard({
  comment,
  setTargetComment,
  className,
  type,
  onDeleteComment,
  parentId = null,
}) {
  const t = useTranslations();
  const { user } = useAuthStore((state) => state);

  return (
    <div className="CommentWrapper">
      <div className="CommentCard">
        <Link
          aria-label="Profile"
          to={
            +comment?.user_id === +user?.id
              ? "/profile"
              : `/profile/${comment?.user_id}`
          }
          className="img"
        >
          <Image
            width={36}
            height={36}
            src={comment?.user_image}
            alt={comment?.user_name}
          />
        </Link>

        <div className="content">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <h6 className="mb-0">{comment?.user_name}</h6>
            {comment?.rate && <StarsRate rate={comment?.rate} />}
          </div>

          <div className="comment">
            <p>{comment?.comment}</p>
          </div>

          <div className="actions">
            <span>{comment?.date}</span>

            <button onClick={() => setTargetComment(comment)}>
              {t("reply")}
            </button>

            {comment?.user_id === user?.id && (
              <button
                onClick={() => onDeleteComment?.(comment.id, parentId, type)}
              >
                {t("delete")}
              </button>
            )}
          </div>
        </div>
      </div>

      {comment?.replies?.length > 0 && (
        <div className={`replies ${className}`}>
          {comment.replies.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              className={className}
              setTargetComment={setTargetComment}
              type={type}
              onDeleteComment={onDeleteComment}
              parentId={comment.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
