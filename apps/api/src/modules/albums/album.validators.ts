import { ValidationError } from '../../utils/errors.js';

const MIN_TITLE_LENGTH = 1;
const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_TAG_COUNT = 50;
const MAX_TAG_LENGTH = 64;

const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;

export function validateAlbumTitle(title: unknown): string {
  if (typeof title !== 'string') {
    throw new ValidationError('Title is required');
  }
  const trimmed = title.trim();
  if (trimmed.length < MIN_TITLE_LENGTH) {
    throw new ValidationError('Title is required');
  }
  if (trimmed.length > MAX_TITLE_LENGTH) {
    throw new ValidationError(`Title must be at most ${MAX_TITLE_LENGTH} characters`);
  }
  return trimmed;
}

export function validateAlbumDescription(description: unknown): string {
  if (typeof description !== 'string') {
    throw new ValidationError('Description must be a string');
  }
  const trimmed = description.trim();
  if (trimmed.length > MAX_DESCRIPTION_LENGTH) {
    throw new ValidationError(
      `Description must be at most ${MAX_DESCRIPTION_LENGTH} characters`,
    );
  }
  return trimmed;
}

export function validateAlbumTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) {
    throw new ValidationError('Tags must be an array');
  }
  if (tags.length > MAX_TAG_COUNT) {
    throw new ValidationError(`At most ${MAX_TAG_COUNT} tags are allowed`);
  }
  return tags.map((tag, i) => {
    if (typeof tag !== 'string' || tag.trim() === '') {
      throw new ValidationError(`Tag at index ${i} must be a non-empty string`);
    }
    const trimmed = tag.trim();
    if (trimmed.length > MAX_TAG_LENGTH) {
      throw new ValidationError(
        `Tag at index ${i} must be at most ${MAX_TAG_LENGTH} characters`,
      );
    }
    return trimmed;
  });
}

export function validateCoverImageUrl(url: unknown): string {
  if (typeof url !== 'string' || url.trim() === '') {
    throw new ValidationError('Cover image URL must be a non-empty string');
  }
  return url.trim();
}

export function validateEventDate(value: unknown): Date {
  if (value instanceof Date) {
    if (isNaN(value.getTime())) {
      throw new ValidationError('Event date is invalid');
    }
    return value;
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new ValidationError('Event date is invalid');
    }
    return date;
  }
  throw new ValidationError('Event date must be a valid date');
}

export function validateAlbumOwnerId(ownerId: unknown): string {
  if (typeof ownerId !== 'string' || !OBJECT_ID_REGEX.test(ownerId)) {
    throw new ValidationError('Owner ID is invalid');
  }
  return ownerId;
}

export interface ValidatedCreateAlbumInput {
  ownerId: string;
  title: string;
  description?: string;
  tags: string[];
  coverImageUrl?: string;
  eventDate?: Date;
}

export function validateCreateAlbumInput(input: {
  ownerId: unknown;
  title: unknown;
  description?: unknown;
  tags?: unknown;
  coverImageUrl?: unknown;
  eventDate?: unknown;
}): ValidatedCreateAlbumInput {
  const result: ValidatedCreateAlbumInput = {
    ownerId: validateAlbumOwnerId(input.ownerId),
    title: validateAlbumTitle(input.title),
    tags: input.tags !== undefined ? validateAlbumTags(input.tags) : [],
  };

  if (input.description !== undefined) {
    result.description = validateAlbumDescription(input.description);
  }
  if (input.coverImageUrl !== undefined) {
    result.coverImageUrl = validateCoverImageUrl(input.coverImageUrl);
  }
  if (input.eventDate !== undefined) {
    result.eventDate = validateEventDate(input.eventDate);
  }

  return result;
}

export interface ValidatedUpdateAlbumInput {
  title?: string;
  description?: string;
  tags?: string[];
  coverImageUrl?: string;
  eventDate?: Date;
}

export function validateUpdateAlbumInput(input: {
  title?: unknown;
  description?: unknown;
  tags?: unknown;
  coverImageUrl?: unknown;
  eventDate?: unknown;
}): ValidatedUpdateAlbumInput {
  const result: ValidatedUpdateAlbumInput = {};

  if (input.title !== undefined) result.title = validateAlbumTitle(input.title);
  if (input.description !== undefined) result.description = validateAlbumDescription(input.description);
  if (input.tags !== undefined) result.tags = validateAlbumTags(input.tags);
  if (input.coverImageUrl !== undefined) result.coverImageUrl = validateCoverImageUrl(input.coverImageUrl);
  if (input.eventDate !== undefined) result.eventDate = validateEventDate(input.eventDate);

  if (Object.keys(result).length === 0) {
    throw new ValidationError('At least one field must be provided for update');
  }

  return result;
}
