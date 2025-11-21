
// Extend HTMLInputElement for folder upload
interface HTMLInputElement {
  webkitdirectory?: boolean;
}

// Module declaration for imagekitio-react
declare module "imagekitio-react" {
  import * as React from "react";

  interface IKImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    urlEndpoint: string;
    path: string;
    transformation?: Array<{ [key: string]: any }>;
    loading?: "lazy" | "eager";
  }

  export class IKImage extends React.Component<IKImageProps> {}
}
