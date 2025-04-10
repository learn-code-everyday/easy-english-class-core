import { Request, Response } from "express";
import { parseInt } from "lodash";
import { ErrorHelper } from "../../helpers";
export default [
  {
    method: "get",
    path: "/meta/details/:id",
    midd: [],
    action: async (req: Request, res: Response) => {
      const { id } = req.params;
      // console.log("data", id);
      const tokenId = parseInt(id);
      if (typeof tokenId !== "number") {
        throw ErrorHelper.requestDataInvalid(id);
      }

      res.json({});
    },
  },
];
