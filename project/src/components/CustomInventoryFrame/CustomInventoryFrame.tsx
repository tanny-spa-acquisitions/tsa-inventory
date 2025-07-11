import { AuthContext } from "@/contexts/authContext";
import { useVideo } from "@/contexts/videoContext";
import { appTheme } from "@/util/appTheme";
import { FRONTEND_URL } from "@/util/config";
import { capitalizeFirstLetter, iso8601ToSeconds } from "@/util/functions/Data";
import { formatTimeStamp } from "@/util/functions/YouTubeData";
import Link from "next/link";
import { useContext } from "react";

const CustomInventoryFrame = ({
  item,
  index,
}: {
  item: any[];
  index: number;
}) => {
  const { currentUser } = useContext(AuthContext);

  const TubTitle = item[1];
  const TubMake = item[4];
  const TubModel = item[5];
  const TubPrice = item[6];
  const TubID = item[7];

  if (!currentUser) return;
  return (
    <Link
      href={
        TubID && TubID.trim().length !== 0 ? `/products/${TubID}` : "/products"
      }
      className="group cursor-pointer rounded-[5px] overflow-hidden relative w-[100%] h-[100%] flex flex-col"
      style={{
        backgroundColor: appTheme[currentUser.theme].background_2,
      }}
    >
      <div className="dim group-hover:brightness-75 w-[100%] h-[100%]">
        <div className="relative w-[100%] aspect-[16/9] overflow-hidden">
          <img
            className="w-[100%] h-[100%] object-cover"
            src={
              "https://images.unsplash.com/photo-1751786210867-a886b5996bf2?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwyNXx8fGVufDB8fHx8fA%3D%3D"
            }
          />
          <div className="absolute bottom-[9px] right-[10px] bg-white py-[6px] px-[10px] rounded-[6px] flex flex-row gap-[6px] items-center justify-center">
            <p className="text-[11px] leading-[11px] font-[500] mt-[1px] text-black">
              {TubPrice && TubPrice.trim().length !== 0 ? TubPrice : "No Price"}
            </p>
          </div>

          {/* <div className="absolute bottom-[10px] left-[12px]  py-[4px] px-[8px] bg-black/60 rounded-[6px] flex flex-row gap-[6px] items-center justify-center">
            <p className="text-[11px] leading-[11px] font-[600] mt-[1px] text-white">
              {formatTimeStamp(
                iso8601ToSeconds(
                  recentVideosData[index].video_data.contentDetails.duration
                )
              )}
            </p>
          </div> */}
        </div>
        {/* {isRecent && (
          <div
            className="w-[100%] h-[2.5px] bottom-[-2.5px]"
            style={{
              backgroundColor: appTheme[currentUser.theme].background_3,
            }}
          >
            {recentVideosData && (
              <div
                style={{
                  width: `${
                    (recentVideosData[index].last_timestamp /
                      iso8601ToSeconds(
                        recentVideosData[index].video_data.contentDetails
                          .duration
                      )) *
                    100
                  }%`,
                }}
                className="bg-red-400 h-[2.5px] bottom-0"
              />
            )}
          </div>
        )} */}
        <div className="w-[100%] relative flex flex-col pt-[5px] mb-[47px] px-[13px] gap-[6px]">
          <p
            className="font-[500] truncate w-[100%] overflow-hidden text-[14px] leading-[14px] tracking-[0.2px] mt-[5px]"
            style={{
              color: appTheme[currentUser.theme].text_1,
            }}
          >
            {capitalizeFirstLetter(TubTitle)}
          </p>
        </div>
      </div>

      <div className="group-hover:brightness-75 hover:brightness-100 dim absolute bottom-[7px] left-0 mx-[9px] py-[2px] pr-[6px] pl-[4px]  w-fit flex flex-row gap-[8px] items-center">
        <div className="w-[25px] h-[25px] min-w-[25px] overflow-hidden rounded-full">
          <img
            className="w-[100%] h-[100%] object-cover"
            src={
              "https://images.unsplash.com/photo-1751786210867-a886b5996bf2?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwyNXx8fGVufDB8fHx8fA%3D%3D"
            }
          />
        </div>
        <div className="overflow-hidden flex flex-col w-[100%] gap-[3px]">
          <p
            className="truncate overflow-hidden font-[400] w-[100%] text-[14px] leading-[14px] tracking-[0.2px]"
            style={{
              color: appTheme[currentUser.theme].text_1,
            }}
          >
            {TubMake && TubMake.trim().length !== 0
              ? TubModel && TubModel.trim().length !== 0
                ? `${capitalizeFirstLetter(TubMake)} | ${capitalizeFirstLetter(TubModel)}`
                : capitalizeFirstLetter(TubMake)
              : ""}
          </p>

          <p
            className="truncate overflow-hidden font-[300] w-[100%] text-[10px] leading-[12px] tracking-[0.2px]"
            style={{
              color: appTheme[currentUser.theme].text_1,
            }}
          >
            {TubID && TubID.trim().length !== 0 ? TubID : "No ID"}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default CustomInventoryFrame;
