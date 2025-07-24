import { AuthContext } from "@/contexts/authContext";
import { Product } from "@/contexts/queryContext";
import { appTheme } from "@/util/appTheme";
import { capitalizeFirstLetter } from "@/util/functions/Data";
import Link from "next/link";
import { useContext } from "react";

const CustomInventoryFrame = ({
  item,
  index,
}: {
  item: Product;
  index: number;
}) => {
  const { currentUser } = useContext(AuthContext);

  const TubTitle = item.name;
  const TubMake = item.make;
  const TubModel = item.model;
  const TubPrice = "$" + item.price;
  const TubID = item.serial_number;

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
              item.images.length > 0
                ? item.images[0]
                : "https://images.unsplash.com/photo-1632341503970-dbec32e7ec76?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            }
          />
          <div
            style={{
              backgroundColor: appTheme[currentUser.theme].background_2,
            }}
            className="absolute bottom-[9px] right-[10px] py-[6px] px-[10px] rounded-[6px] flex flex-row gap-[6px] items-center justify-center"
          >
            <p
              style={{ color: appTheme[currentUser.theme].text_1 }}
              className="text-[11px] leading-[11px] font-[400] mt-[1px]"
            >
              {TubPrice && TubPrice.trim().length !== 0 ? TubPrice : "No Price"}
            </p>
          </div>
        </div>
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
        <div
          className="w-[25px] h-[25px] min-w-[25px] overflow-hidden rounded-full"
          style={{
            backgroundColor: appTheme[currentUser.theme].background_2_2,
            border: `0.5px solid ${appTheme[currentUser.theme].background_4}`,
          }}
        >
          <img
            className="w-[100%] h-[100%] p-[5px] object-contain"
            src={"/assets/logo-black.png"}
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
                ? `${capitalizeFirstLetter(TubMake)} | ${capitalizeFirstLetter(
                    TubModel
                  )}`
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
