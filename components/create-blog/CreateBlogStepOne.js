import PdpTextbox1 from "@/assets/textbox/PdpTextbox1";
import ApiDropdownField from "./ApiDropdownField";
import { DROPDOWN_FIELDS } from "./createBlog.constants";

export default function CreateBlogStepOne({
  formData,
  coverInputValue,
  dropdownState,
  getSelectedLabel,
  handleChange,
  handleCoverUpload,
  loadDropdown,
  addDropdownOption,
}) {
  return (
    <div className="step-one">
      <PdpTextbox1
        label="Blog Title"
        name="title"
        id="title"
        placeholder="Enter blog title"
        value={formData.title}
        onChange={handleChange}
      />

      <div className="grid-2">
        <PdpTextbox1
          label="Blog Subtitle"
          name="subtitle"
          id="subtitle"
          placeholder="Enter blog subtitle"
          value={formData.subtitle}
          onChange={handleChange}
        />

        <div className="cover-field">
          <PdpTextbox1
            label="Blog Cover Image"
            type="file"
            name="cover"
            id="cover"
            placeholder="Upload a cover image"
            value={coverInputValue}
            onChange={handleCoverUpload}
          />

          <span className="helper-text">
            Accepted formats: JPEG, SVG, & WEBP • Max size: 2MB
          </span>
        </div>
      </div>

      <div className="section">
        <h3 className="section-title">Content Classification</h3>
        <p className="section-desc">Organize this blog using group, category, and subcategory.</p>

        <div className="grid-3">
          <ApiDropdownField
            label="Group"
            value={getSelectedLabel("group", formData.group)}
            placeholder="Select group"
            options={dropdownState.group.options}
            loading={dropdownState.group.loading}
            onOpen={() => loadDropdown(DROPDOWN_FIELDS.group)}
            onSelect={(option) => handleChange({ target: { name: "group", value: option.value } })}
            onAdd={(label) => addDropdownOption(DROPDOWN_FIELDS.group, label)}
          />

          <ApiDropdownField
            label="Category"
            value={getSelectedLabel("category", formData.category)}
            placeholder={formData.group ? "Select category" : "Select group first"}
            options={dropdownState.category.options}
            loading={dropdownState.category.loading}
            disabled={!formData.group}
            onOpen={() => loadDropdown(DROPDOWN_FIELDS.category)}
            onSelect={(option) => handleChange({ target: { name: "category", value: option.value } })}
            onAdd={(label) => addDropdownOption(DROPDOWN_FIELDS.category, label)}
          />

          <ApiDropdownField
            label="Subcategory"
            value={getSelectedLabel("subcategory", formData.subcategory)}
            placeholder={formData.category ? "Select subcategory" : "Select category first"}
            options={dropdownState.subcategory.options}
            loading={dropdownState.subcategory.loading}
            disabled={!formData.category}
            onOpen={() => loadDropdown(DROPDOWN_FIELDS.subcategory)}
            onSelect={(option) => handleChange({ target: { name: "subcategory", value: option.value } })}
            onAdd={(label) => addDropdownOption(DROPDOWN_FIELDS.subcategory, label)}
          />
        </div>
      </div>

      <div className="divider" />

      <div className="section">
        <h3 className="section-title">Location Classification</h3>
        <p className="section-desc">Organize this blog using country, state, district, and city.</p>

        <div className="grid-2">
          <ApiDropdownField
            label="Country"
            value={getSelectedLabel("country", formData.country)}
            placeholder="Select country"
            options={dropdownState.country.options}
            loading={dropdownState.country.loading}
            direction="up"
            showSearch={true}
            onOpen={() => loadDropdown(DROPDOWN_FIELDS.country)}
            onSelect={(option) => handleChange({ target: { name: "country", value: option.value } })}
          />

          <ApiDropdownField
            label="State"
            value={getSelectedLabel("state", formData.state)}
            placeholder={formData.country ? "Select state" : "Select country first"}
            options={dropdownState.state.options}
            loading={dropdownState.state.loading}
            disabled={!formData.country}
            direction="up"
            showSearch={true}
            onOpen={() => loadDropdown(DROPDOWN_FIELDS.state)}
            onSelect={(option) => handleChange({ target: { name: "state", value: option.value } })}
            onAdd={(label) => addDropdownOption(DROPDOWN_FIELDS.state, label)}
          />

          <ApiDropdownField
            label="District"
            value={getSelectedLabel("district", formData.district)}
            placeholder={formData.state ? "Select district" : "Select state first"}
            options={dropdownState.district.options}
            loading={dropdownState.district.loading}
            disabled={!formData.state}
            direction="up"
            showSearch={true}
            onOpen={() => loadDropdown(DROPDOWN_FIELDS.district)}
            onSelect={(option) => handleChange({ target: { name: "district", value: option.value } })}
            onAdd={(label) => addDropdownOption(DROPDOWN_FIELDS.district, label)}
          />

          <ApiDropdownField
            label="City"
            value={getSelectedLabel("city", formData.city)}
            placeholder={formData.district ? "Select city" : "Select district first"}
            options={dropdownState.city.options}
            loading={dropdownState.city.loading}
            disabled={!formData.district}
            direction="up"
            showSearch={true}
            onOpen={() => loadDropdown(DROPDOWN_FIELDS.city)}
            onSelect={(option) => handleChange({ target: { name: "city", value: option.value } })}
            onAdd={(label) => addDropdownOption(DROPDOWN_FIELDS.city, label)}
          />
        </div>
      </div>
    </div>
  );
}
