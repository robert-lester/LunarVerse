interface ArrayChunker<Contents> {
  (arr: Array<Contents>): Array<Array<Contents>>;
}

export default abstract class Utils {
  /**
   * Factory function that returns a function to split arrays into subarrays
   * @param chunkSize The number of items to allow per array
   */
  public static getArrayChunker<Contents>(chunkSize: number): ArrayChunker<Contents> {
    return (arr: Array<Contents>) => {
      const chunkCount = Math.ceil(arr.length / chunkSize);
      const chunks: Array<Array<Contents>> = [];
      let i = 0;
    
      while (i < chunkCount) {
        chunks.push(arr.splice(0, chunkSize));
        i += 1;
      }
      return chunks;
    };
  }
}