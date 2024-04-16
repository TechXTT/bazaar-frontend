const BucketImage = ({ key, className, imageURL, name }: { key: string|null, className: string; imageURL: string, name: string }) => {
    return (
        <img
        key={key}
        src={
          "https://the-bazaar-bucket.s3.eu-central-1.amazonaws.com/" +
          imageURL
        }
        alt={name}
        className={className}
      />
    );
  };

  export default BucketImage;