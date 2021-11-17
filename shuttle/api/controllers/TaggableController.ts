import Controller from './Controller';
import { Destination, Tag, Response } from '../models';

abstract class TaggableController extends Controller {
  /**
   * A helper function to handle formatting tags for a "graph insert" on create and update
   * @param tags Unformatted tag data. "{ 'id': num }" is for existing tags and "{ 'name': str }" is for new tags
   * @param organization The organization the Tags belong to
   * @returns A formatted object that is usable with ".graphInsert()"
   */
  protected static buildGraphTagObject(tags: Tag[], organization: string): Tag[] {
    // See https://vincit.github.io/objection.js/#graph-inserts
    const graphTags: Tag[] = [];

    tags.forEach((tag: Tag) => {
      // No ID means its a new tag
      if (!/^\d+$/.test(String(tag.id))) {
        const newTag: any = {
          name: tag.name,
          organization_id: organization,
          created_at: new Date(),
          updated_at: new Date(),
        };
        graphTags.push(newTag);
      } else {
        const existingTagReference: any = {
          '#dbRef': tag.id,
        };
        graphTags.push(existingTagReference);
      }
    });

    return graphTags;
  }
}

export default TaggableController;