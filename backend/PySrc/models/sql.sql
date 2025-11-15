SELECT 
        `wind_power_data`.`device_id` AS `device_id`,
        `wind_power_data`.`name` AS `name`,
        MIN(DATE_FORMAT(`wind_power_data`.`record_time`, '%Y-%m-01')) AS `month_start_date`,
        DATE_FORMAT(`wind_power_data`.`record_time`, '%Y-%m') AS `year_months`,
        COUNT(DISTINCT CAST(`wind_power_data`.`record_time` AS DATE)) AS `days_in_month`,
        COUNT(0) AS `total_samples`,
        MIN(`wind_power_data`.`record_time`) AS `month_start_time`,
        MAX(`wind_power_data`.`record_time`) AS `month_end_time`,
        AVG(`wind_power_data`.`fd_wind_speed_5min`) AS `fd_wind_speed`,
        MIN(`wind_power_data`.`fd_wind_speed_5min`) AS `min_wind_speed`,
        MAX(`wind_power_data`.`fd_wind_speed_5min`) AS `max_wind_speed`,
        STD(`wind_power_data`.`fd_wind_speed_5min`) AS `std_wind_speed`,
        AVG(`wind_power_data`.`fd_wind_director_10min`) AS `fd_wind_director`,
        AVG(`wind_power_data`.`fd_output_power`) AS `fd_output_power`,
        MIN(`wind_power_data`.`fd_output_power`) AS `min_output_power`,
        MAX(`wind_power_data`.`fd_output_power`) AS `max_output_power`,
        STD(`wind_power_data`.`fd_output_power`) AS `std_output_power`,
        (SUBSTRING_INDEX(GROUP_CONCAT(`wind_power_data`.`month_energy`
                    ORDER BY `wind_power_data`.`record_time` DESC
                    SEPARATOR ','),
                ',',
                1) - SUBSTRING_INDEX(GROUP_CONCAT(`wind_power_data`.`month_energy`
                    ORDER BY `wind_power_data`.`record_time` ASC
                    SEPARATOR ','),
                ',',
                1)) AS `actual_month_energy`,
        SUBSTRING_INDEX(GROUP_CONCAT(`wind_power_data`.`year_energy`
                    ORDER BY `wind_power_data`.`record_time` DESC
                    SEPARATOR ','),
                ',',
                1) AS `year_energy`,
        SUBSTRING_INDEX(GROUP_CONCAT(`wind_power_data`.`total_energy`
                    ORDER BY `wind_power_data`.`record_time` DESC
                    SEPARATOR ','),
                ',',
                1) AS `total_energy`,
        AVG(`wind_power_data`.`fd_temperature_w`) AS `fd_temperature_w`,
        MIN(`wind_power_data`.`fd_temperature_w`) AS `min_temperature_w`,
        MAX(`wind_power_data`.`fd_temperature_w`) AS `max_temperature_w`,
        AVG(`wind_power_data`.`fd_nace_temp`) AS `fd_nace_temp`,
        MIN(`wind_power_data`.`fd_nace_temp`) AS `min_nace_temp`,
        MAX(`wind_power_data`.`fd_nace_temp`) AS `max_nace_temp`,
        (SUM((CASE
            WHEN (`wind_power_data`.`fd_output_power` > 0) THEN 1
            ELSE 0
        END)) / COUNT(0)) AS `generation_rate`,
        (SUM((CASE
            WHEN (`wind_power_data`.`iw_system_alarm_status` > 0) THEN 1
            ELSE 0
        END)) / COUNT(0)) AS `alarm_rate`,
        COUNT(DISTINCT `wind_power_data`.`iw_system_current_ctrl_mode`) AS `ctrl_mode_changes`,
        COUNT(DISTINCT `wind_power_data`.`iw_system_current_run_mode`) AS `run_mode_changes`,
        COUNT(DISTINCT `wind_power_data`.`iw_system_alarm_status`) AS `alarm_status_changes`,
        SUBSTRING_INDEX(GROUP_CONCAT(`wind_power_data`.`iw_system_current_ctrl_mode`
                    ORDER BY `wind_power_data`.`record_time` DESC
                    SEPARATOR ','),
                ',',
                1) AS `last_ctrl_mode`,
        SUBSTRING_INDEX(GROUP_CONCAT(`wind_power_data`.`iw_system_current_run_mode`
                    ORDER BY `wind_power_data`.`record_time` DESC
                    SEPARATOR ','),
                ',',
                1) AS `last_run_mode`,
        SUBSTRING_INDEX(GROUP_CONCAT(`wind_power_data`.`iw_system_alarm_status`
                    ORDER BY `wind_power_data`.`record_time` DESC
                    SEPARATOR ','),
                ',',
                1) AS `last_alarm_status`,
        AVG(`wind_power_data`.`grid_feq`) AS `grid_feq`,
        MIN(`wind_power_data`.`grid_feq`) AS `min_grid_feq`,
        MAX(`wind_power_data`.`grid_feq`) AS `max_grid_feq`,
        STD(`wind_power_data`.`grid_feq`) AS `std_grid_feq`,
        AVG(`wind_power_data`.`cos_fai`) AS `cos_fai`,
        AVG(`wind_power_data`.`ug_ab`) AS `avg_voltage_ab`,
        AVG(`wind_power_data`.`ug_bc`) AS `avg_voltage_bc`,
        AVG(`wind_power_data`.`ug_ca`) AS `avg_voltage_ca`,
        MIN(LEAST(`wind_power_data`.`ug_ab`,
                `wind_power_data`.`ug_bc`,
                `wind_power_data`.`ug_ca`)) AS `min_voltage`,
        MAX(GREATEST(`wind_power_data`.`ug_ab`,
                `wind_power_data`.`ug_bc`,
                `wind_power_data`.`ug_ca`)) AS `max_voltage`,
        AVG(`wind_power_data`.`iout_a`) AS `avg_current_a`,
        AVG(`wind_power_data`.`iout_b`) AS `avg_current_b`,
        AVG(`wind_power_data`.`iout_c`) AS `avg_current_c`,
        AVG(`wind_power_data`.`power_pac`) AS `avg_active_power`,
        AVG(`wind_power_data`.`power_qac`) AS `avg_reactive_power`,
        MAX(`wind_power_data`.`power_pac`) AS `max_active_power`,
        ((SUM((CASE
            WHEN (`wind_power_data`.`fd_output_power` > 0) THEN 1
            ELSE 0
        END)) / COUNT(0)) * TIMESTAMPDIFF(HOUR,
            MIN(`wind_power_data`.`record_time`),
            MAX(`wind_power_data`.`record_time`))) AS `effective_generation_hours`,
        ((SUM((CASE
            WHEN (`wind_power_data`.`fd_output_power` > 0) THEN `wind_power_data`.`fd_output_power`
            ELSE 0
        END)) / NULLIF(SUM((CASE
                    WHEN (`wind_power_data`.`fd_output_power` > 0) THEN 1
                    ELSE 0
                END)),
                0)) / NULLIF(MAX(ABS(`wind_power_data`.`fd_output_power`)),
                0)) AS `capacity_factor`,
        SUBSTRING_INDEX(GROUP_CONCAT(`wind_power_data`.`running_days`
                    ORDER BY `wind_power_data`.`record_time` DESC
                    SEPARATOR ','),
                ',',
                1) AS `total_running_days`,
        SUBSTRING_INDEX(GROUP_CONCAT(`wind_power_data`.`running_hour`
                    ORDER BY `wind_power_data`.`record_time` DESC
                    SEPARATOR ','),
                ',',
                1) AS `total_running_hours`,
        (CASE
            WHEN
                (AVG(`wind_power_data`.`fd_wind_speed_5min`) > 0)
            THEN
                (AVG(`wind_power_data`.`fd_output_power`) / ((0.5 * 1.225) * POW(AVG(`wind_power_data`.`fd_wind_speed_5min`),
                        3)))
            ELSE NULL
        END) AS `power_coefficient`,
        (COUNT(0) / (TIMESTAMPDIFF(HOUR,
            MIN(`wind_power_data`.`record_time`),
            MAX(`wind_power_data`.`record_time`)) * 3600)) AS `data_availability`,
        COUNT(DISTINCT (CASE
                WHEN (`wind_power_data`.`iw_system_alarm_status` > 0) THEN CAST(`wind_power_data`.`record_time` AS DATE)
            END)) AS `days_with_alarms`,
        AVG((CASE
            WHEN (`wind_power_data`.`fd_wind_speed_5min` BETWEEN 3 AND 25) THEN `wind_power_data`.`fd_output_power`
            ELSE NULL
        END)) AS `avg_power_in_operating_range`
    FROM
        `wind_power_data`
    GROUP BY `wind_power_data`.`device_id`, 
             `wind_power_data`.`name`, 
             DATE_FORMAT(`wind_power_data`.`record_time`, '%Y-%m')
    ORDER BY `month_start_date` DESC